import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tickets'

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
        .onDelete('RESTRICT')
      table.string('reference').nullable().unique()
      table.string('category').notNullable().defaultTo('general')
      table.string('priority').notNullable().defaultTo('medium')
      table.string('status').notNullable().defaultTo('open')
      table.string('title').notNullable()
      table.text('description').notNullable()
      table.timestamp('resolved_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['status'])
      table.index(['priority'])
      table.index(['unit_id'])
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
