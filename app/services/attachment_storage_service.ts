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
}

export class AttachmentStorageProviderError extends Error {
  constructor(
    message: string,
    public readonly operation: 'upload' | 'read' | 'delete' | 'exists' | 'healthcheck',
    options?: { cause?: unknown }
  ) {
    super(message, options)
    this.name = 'AttachmentStorageProviderError'
  }
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

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: storageKey,
          Body: content,
          ContentType: file.type ?? 'application/octet-stream',
        })
      )
    } catch (error) {
      throw new AttachmentStorageProviderError(
        'Failed to upload attachment to S3 provider',
        'upload',
        {
          cause: error,
        }
      )
    }

    return {
      storageDriver: this.driver,
      storageKey,
    }
  }

  async getReadUrl(storageKey: string): Promise<string> {
    this.assertSafeStorageKey(storageKey)
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: storageKey,
    })

    try {
      return await getSignedUrl(this.client, command, {
        expiresIn: this.config.signedUrlTtlSeconds,
      })
    } catch (error) {
      throw new AttachmentStorageProviderError(
        'Failed to generate signed URL from S3 provider',
        'read',
        { cause: error }
      )
    }
  }

  async delete(storageKey: string): Promise<void> {
    this.assertSafeStorageKey(storageKey)
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: storageKey,
        })
      )
    } catch (error) {
      throw new AttachmentStorageProviderError(
        'Failed to delete attachment from S3 provider',
        'delete',
        {
          cause: error,
        }
      )
    }
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
      throw new AttachmentStorageProviderError(
        'Failed to check attachment existence on S3 provider',
        'exists',
        {
          cause: error,
        }
      )
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
      throw new AttachmentStorageProviderError('S3 provider healthcheck failed', 'healthcheck')
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
  private static readonly MIN_SIGNED_URL_TTL_SECONDS = 60
  private static readonly MAX_SIGNED_URL_TTL_SECONDS = 900

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
      signedUrlTtlSeconds: this.normalizeSignedUrlTtl(config.signedUrlTtlSeconds),
    }
  }

  private normalizePrefix(prefix: string | undefined): string {
    if (!prefix) {
      return 'tickets'
    }

    return prefix.replace(/^\/+/, '').replace(/\/+$/, '')
  }

  private normalizeSignedUrlTtl(ttlSeconds: number | undefined): number {
    const raw = ttlSeconds ?? 300
    return Math.min(
      AttachmentStorageService.MAX_SIGNED_URL_TTL_SECONDS,
      Math.max(AttachmentStorageService.MIN_SIGNED_URL_TTL_SECONDS, raw)
    )
  }
}
