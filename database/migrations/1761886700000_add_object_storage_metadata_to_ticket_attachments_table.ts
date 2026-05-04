import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ticket_attachments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('storage_driver').nullable()
      table.string('storage_key').nullable()
      table.string('checksum_sha256', 64).nullable()
      table.index(['storage_driver'], 'ticket_attachments_storage_driver_idx')
      table.index(['storage_key'], 'ticket_attachments_storage_key_idx')
      table.string('file_path').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['storage_driver'], 'ticket_attachments_storage_driver_idx')
      table.dropIndex(['storage_key'], 'ticket_attachments_storage_key_idx')
      table.dropColumn('storage_driver')
      table.dropColumn('storage_key')
      table.dropColumn('checksum_sha256')
      table.string('file_path').notNullable().alter()
    })
  }
}
