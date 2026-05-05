import { BaseCommand } from '@adonisjs/core/ace'
import attachmentStorageConfig from '#config/attachment_storage'
import { AttachmentStorageService } from '#services/attachment_storage_service'

export default class StorageCheck extends BaseCommand {
  static commandName = 'storage:check'
  static description = 'Check attachment storage health and configuration'

  static options = {
    startApp: true,
  }

  async run() {
    const driver = attachmentStorageConfig.driver
    this.logger.info(`Attachment storage driver: ${driver}`)

    if (driver === 's3') {
      this.logger.info(`S3 endpoint: ${attachmentStorageConfig.s3.endpoint}`)
      this.logger.info(`S3 region: ${attachmentStorageConfig.s3.region}`)
      this.logger.info(`S3 bucket: ${attachmentStorageConfig.s3.bucket}`)
      this.logger.info(`S3 key prefix: ${attachmentStorageConfig.s3.keyPrefix ?? 'tickets'}`)
      this.logger.info(
        `Signed URL TTL (seconds): ${attachmentStorageConfig.s3.signedUrlTtlSeconds ?? 120}`
      )
    }

    const ok = await new AttachmentStorageService().healthcheck()
    if (!ok) {
      this.exitCode = 1
      this.logger.error('Attachment storage healthcheck returned false')
      return
    }

    this.logger.success('Attachment storage healthcheck OK')
  }
}
