import env from '#start/env'

const rawAttachmentsDriver = env.get('ATTACHMENTS_DRIVER')
const attachmentDriver = rawAttachmentsDriver === 's3' ? 's3' : 'local'

const attachmentStorageConfig = {
  /**
   * Active storage backend.
   * Keep this provider-agnostic (`local` or any S3-compatible provider).
   */
  driver: attachmentDriver,
  local: {
    /**
     * Relative path inside `/public` for local attachments.
     */
    ticketsDir: env.get('ATTACHMENTS_LOCAL_TICKETS_DIR') ?? 'uploads/tickets',
    /**
     * Public URL prefix served by static middleware.
     */
    publicBasePath: env.get('ATTACHMENTS_LOCAL_PUBLIC_BASE_PATH') ?? '/uploads/tickets',
  },
  s3: {
    endpoint: env.get('ATTACHMENTS_S3_ENDPOINT'),
    region: env.get('ATTACHMENTS_S3_REGION'),
    bucket: env.get('ATTACHMENTS_S3_BUCKET'),
    accessKeyId: env.get('ATTACHMENTS_S3_ACCESS_KEY_ID'),
    secretAccessKey: env.get('ATTACHMENTS_S3_SECRET_ACCESS_KEY'),
    forcePathStyle: env.get('ATTACHMENTS_S3_FORCE_PATH_STYLE'),
    keyPrefix: env.get('ATTACHMENTS_S3_KEY_PREFIX'),
    signedUrlTtlSeconds: env.get('ATTACHMENTS_S3_SIGNED_URL_TTL_SECONDS'),
  },
}

export default attachmentStorageConfig
