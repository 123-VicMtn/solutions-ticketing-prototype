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

export class AttachmentStorageService {
  async upload(file: MultipartFile): Promise<StoredAttachment> {
    const storageKey = `${randomUUID()}.${file.extname ?? 'bin'}`
    const destination = this.getAbsoluteTicketsDirectory()

    await file.move(destination, { name: storageKey })

    return {
      storageDriver: 'local',
      storageKey,
      publicPath: this.buildPublicPath(storageKey),
    }
  }

  getReadUrl(storageKey: string): string {
    return this.buildPublicPath(storageKey)
  }

  async delete(storageKey: string): Promise<void> {
    const absolutePath = join(this.getAbsoluteTicketsDirectory(), storageKey)
    await fs.rm(absolutePath, { force: true })
  }

  async exists(storageKey: string): Promise<boolean> {
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

  toStorageKey(publicPath: string): string {
    const prefix = `${attachmentStorageConfig.local.publicBasePath}/`
    if (!publicPath.startsWith(prefix)) {
      throw new Error('Attachment path does not match storage prefix')
    }
    return publicPath.slice(prefix.length)
  }

  getReadUrlFromPublicPath(publicPath: string): string {
    const key = this.toStorageKey(publicPath)
    return this.getReadUrl(key)
  }

  private buildPublicPath(storageKey: string): string {
    return `${attachmentStorageConfig.local.publicBasePath}/${storageKey}`
  }

  private getAbsoluteTicketsDirectory(): string {
    return app.makePath(`public/${attachmentStorageConfig.local.ticketsDir}`)
  }
}
