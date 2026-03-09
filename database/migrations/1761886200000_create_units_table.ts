import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'units'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('building_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('buildings')
        .onDelete('CASCADE')
      table.string('label').notNullable()
      table.integer('floor').notNullable().defaultTo(0)
      table.string('type').notNullable().defaultTo('apartment')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
