import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_units'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('unit_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('units')
        .onDelete('CASCADE')
      table.string('relation').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'unit_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
