import app from '@adonisjs/core/services/app'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type { MultipartFile } from '@adonisjs/bodyparser/types'
import attachmentStorageConfig from '#config/attachment_storage'

export type AttachmentStorageDriver = 'local'

export type StoredAttachment = {
  storageDriver: AttachmentStorageDriver
  storageKey: string
  publicPath: string
}

interface AttachmentStorageDriverContract {
  readonly driver: AttachmentStorageDriver
  upload(file: MultipartFile): Promise<StoredAttachment>
  getReadUrl(storageKey: string): string
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

  getReadUrl(storageKey: string): string {
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

export class AttachmentStorageService {
  private readonly driver: AttachmentStorageDriverContract

  constructor() {
    this.driver = this.resolveDriver()
  }

  upload(file: MultipartFile): Promise<StoredAttachment> {
    return this.driver.upload(file)
  }

  getReadUrl(storageKey: string): string {
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

  getReadUrlFromPublicPath(publicPath: string): string {
    const key = this.toStorageKey(publicPath)
    return this.getReadUrl(key)
  }

  private resolveDriver(): AttachmentStorageDriverContract {
    switch (attachmentStorageConfig.driver) {
      case 'local':
        return new LocalAttachmentStorageDriver()
      default:
        throw new Error(`Unsupported attachment storage driver: ${attachmentStorageConfig.driver}`)
    }
  }
}
