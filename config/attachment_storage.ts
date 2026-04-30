const attachmentStorageConfig = {
  /**
   * Driver currently used for ticket attachments.
   * Next migration step will add `s3`.
   */
  driver: 'local' as const,
  local: {
    /**
     * Relative path inside `/public` for attachment files.
     */
    ticketsDir: 'uploads/tickets',
    /**
     * Public URL prefix served by static middleware.
     */
    publicBasePath: '/uploads/tickets',
  },
}

export default attachmentStorageConfig
