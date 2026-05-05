import { Result, BaseCheck } from '@adonisjs/core/health'
import type { HealthCheckResult } from '@adonisjs/core/types/health'
import {
  AttachmentStorageProviderError,
  AttachmentStorageService,
} from '#services/attachment_storage_service'

export class AttachmentStorageCheck extends BaseCheck {
  name = 'Attachment storage check'

  async run(): Promise<HealthCheckResult> {
    try {
      const ok = await new AttachmentStorageService().healthcheck()
      return ok
        ? Result.ok('Attachment storage is operational')
        : Result.warning('Attachment storage is degraded')
    } catch (error) {
      if (error instanceof AttachmentStorageProviderError) {
        return Result.warning('Attachment storage provider error').mergeMetaData({
          operation: error.operation,
          error: error.message,
        })
      }
      return Result.warning('Attachment storage check failed').mergeMetaData({
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
}
