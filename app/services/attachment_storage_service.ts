import app from '@adonisjs/core/services/app'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type { MultipartFile } from '@adonisjs/bodyparser/types'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import attachmentStorageConfig from '#config/attachment_storage'

export type AttachmentStorageDriver = 'local' | 's3'

export type StoredAttachment = {
  storageDriver: AttachmentStorageDriver
  storageKey: string
  publicPath: string
}

interface AttachmentStorageDriverContract {
  readonly driver: AttachmentStorageDriver
  upload(file: MultipartFile): Promise<StoredAttachment>
  getReadUrl(storageKey: string): Promise<string>
  delete(storageKey: string): Promise<void>
  exists(storageKey: string): Promise<boolean>
  healthcheck(): Promise<boolean>
}

class LocalAttachmentStorageDriver implements AttachmentStorageDriverContract {
  readonly driver: AttachmentStorageDriver = 'local'

  async upload(file: MultipartFile): Promise<StoredAttachment> {
    const storageKey = `${randomUUID()}.${file.extname ?? 'bin'}`
    const destination = this.getAbsoluteTicketsDirectory()

    await fs.mkdir(destination, { recursive: true })
    await file.move(destination, { name: storageKey })

    if (!file.isValid || !file.fileName) {
      throw new Error('Unable to persist attachment on local storage')
    }

    return {
      storageDriver: this.driver,
      storageKey,
      publicPath: this.buildPublicPath(storageKey),
    }
  }

  async getReadUrl(storageKey: string): Promise<string> {
    this.assertSafeStorageKey(storageKey)
    return this.buildPublicPath(storageKey)
  }

  async delete(storageKey: string): Promise<void> {
    this.assertSafeStorageKey(storageKey)
    const absolutePath = join(this.getAbsoluteTicketsDirectory(), storageKey)
    await fs.rm(absolutePath, { force: true })
  }

  async exists(storageKey: string): Promise<boolean> {
    this.assertSafeStorageKey(storageKey)
    const absolutePath = join(this.getAbsoluteTicketsDirectory(), storageKey)

    try {
      await fs.access(absolutePath)
      return true
    } catch {
      return false
    }
  }

  async healthcheck(): Promise<boolean> {
    try {
      await fs.mkdir(this.getAbsoluteTicketsDirectory(), { recursive: true })
      return true
    } catch {
      return false
    }
  }

  private buildPublicPath(storageKey: string): string {
    return `${attachmentStorageConfig.local.publicBasePath}/${storageKey}`
  }

  private getAbsoluteTicketsDirectory(): string {
    return app.makePath(`public/${attachmentStorageConfig.local.ticketsDir}`)
  }

  private assertSafeStorageKey(storageKey: string): void {
    const isSafe = /^[a-zA-Z0-9._-]+$/.test(storageKey)
    if (!isSafe) {
      throw new Error('Unsafe attachment storage key')
    }
  }
}

type S3DriverConfig = {
  endpoint: string
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  forcePathStyle: boolean
  keyPrefix: string
  signedUrlTtlSeconds: number
}

class S3AttachmentStorageDriver implements AttachmentStorageDriverContract {
  readonly driver: AttachmentStorageDriver = 's3'
  private readonly client: S3Client

  constructor(private readonly config: S3DriverConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }

  async upload(file: MultipartFile): Promise<StoredAttachment> {
    if (!file.tmpPath) {
      throw new Error('Attachment file is missing temporary path')
    }

    const storageKey = this.buildStorageKey(file.extname)
    const content = await fs.readFile(file.tmpPath)

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: storageKey,
        Body: content,
        ContentType: file.type ?? 'application/octet-stream',
      })
    )

    return {
      storageDriver: this.driver,
      storageKey,
      publicPath: '',
    }
  }

  async getReadUrl(storageKey: string): Promise<string> {
    this.assertSafeStorageKey(storageKey)
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: storageKey,
    })

    return getSignedUrl(this.client, command, {
      expiresIn: this.config.signedUrlTtlSeconds,
    })
  }

  async delete(storageKey: string): Promise<void> {
    this.assertSafeStorageKey(storageKey)
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: storageKey,
      })
    )
  }

  async exists(storageKey: string): Promise<boolean> {
    this.assertSafeStorageKey(storageKey)
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: storageKey,
        })
      )
      return true
    } catch (error) {
      if (
        error instanceof S3ServiceException &&
        (error.name === 'NotFound' || error.$metadata.httpStatusCode === 404)
      ) {
        return false
      }
      return false
    }
  }

  async healthcheck(): Promise<boolean> {
    try {
      await this.client.send(
        new HeadBucketCommand({
          Bucket: this.config.bucket,
        })
      )
      return true
    } catch {
      return false
    }
  }

  private buildStorageKey(extname: string | undefined): string {
    const filename = `${randomUUID()}.${extname ?? 'bin'}`
    return this.config.keyPrefix ? `${this.config.keyPrefix}/${filename}` : filename
  }

  private assertSafeStorageKey(storageKey: string): void {
    const isSafe = /^[a-zA-Z0-9._/-]+$/.test(storageKey) && !storageKey.includes('..')
    if (!isSafe) {
      throw new Error('Unsafe attachment storage key')
    }
  }
}

export class AttachmentStorageService {
  private readonly driver: AttachmentStorageDriverContract

  constructor() {
    this.driver = this.resolveDriver()
  }

  upload(file: MultipartFile): Promise<StoredAttachment> {
    return this.driver.upload(file)
  }

  async getReadUrl(storageKey: string): Promise<string> {
    return this.driver.getReadUrl(storageKey)
  }

  delete(storageKey: string): Promise<void> {
    return this.driver.delete(storageKey)
  }

  exists(storageKey: string): Promise<boolean> {
    return this.driver.exists(storageKey)
  }

  healthcheck(): Promise<boolean> {
    return this.driver.healthcheck()
  }

  toStorageKey(publicPath: string): string {
    const prefix = `${attachmentStorageConfig.local.publicBasePath}/`
    if (!publicPath.startsWith(prefix)) {
      throw new Error('Attachment path does not match storage prefix')
    }

    const storageKey = publicPath.slice(prefix.length)
    const isSafe = /^[a-zA-Z0-9._-]+$/.test(storageKey)
    if (!storageKey || !isSafe) {
      throw new Error('Attachment path resolved to an invalid storage key')
    }

    return storageKey
  }

  async getReadUrlFromPublicPath(publicPath: string): Promise<string> {
    const key = this.toStorageKey(publicPath)
    return this.getReadUrl(key)
  }

  private resolveDriver(): AttachmentStorageDriverContract {
    switch (attachmentStorageConfig.driver) {
      case 'local':
        return new LocalAttachmentStorageDriver()
      case 's3':
        return new S3AttachmentStorageDriver(this.getRequiredS3Config())
      default:
        throw new Error(`Unsupported attachment storage driver: ${attachmentStorageConfig.driver}`)
    }
  }

  private getRequiredS3Config(): S3DriverConfig {
    const config = attachmentStorageConfig.s3
    if (
      !config.endpoint ||
      !config.region ||
      !config.bucket ||
      !config.accessKeyId ||
      !config.secretAccessKey
    ) {
      throw new Error('Missing required ATTACHMENTS_S3_* configuration')
    }

    return {
      endpoint: config.endpoint,
      region: config.region,
      bucket: config.bucket,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      forcePathStyle: config.forcePathStyle ?? false,
      keyPrefix: this.normalizePrefix(config.keyPrefix),
      signedUrlTtlSeconds: config.signedUrlTtlSeconds ?? 300,
    }
  }

  private normalizePrefix(prefix: string | undefined): string {
    if (!prefix) {
      return 'tickets'
    }

    return prefix.replace(/^\/+/, '').replace(/\/+$/, '')
  }
}
