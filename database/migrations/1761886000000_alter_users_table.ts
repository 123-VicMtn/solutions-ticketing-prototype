import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('full_name', 'first_name')
      table.string('last_name').nullable()
      table.string('role').notNullable().defaultTo('tenant')
      table.string('phone').nullable()
      table.string('notification_preference').notNullable().defaultTo('email')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('notification_preference')
      table.dropColumn('phone')
      table.dropColumn('role')
      table.dropColumn('last_name')
      table.renameColumn('first_name', 'full_name')
    })
  }
}
