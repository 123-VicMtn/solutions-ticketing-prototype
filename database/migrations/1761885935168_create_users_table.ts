import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('role').notNullable().defaultTo('tenant')
      table.string('status').notNullable().defaultTo('pending')
      table.string('first_name').notNullable()
      table.string('last_name').nullable()
      table.string('email').notNullable().unique()
      table.string('phone').nullable()
      table.string('notification_preference').notNullable().defaultTo('email')
      table.string('password').notNullable()
      table.string('inviteToken').nullable()
      table.timestamp('inviteTokenExpiresAt').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.check(`role IN ('tenant', 'owner', 'manager', 'admin', 'provider')`)
      table.check(`status IN ('pending', 'active', 'rejected', 'suspended')`)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
