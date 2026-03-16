import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Ticket from '#models/ticket'

export default class Provider extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare geranceId: number

  @column()
  declare companyName: string

  @column()
  declare speciality: string

  @column()
  declare phone: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Ticket, { foreignKey: 'providerId' })
  declare tickets: HasMany<typeof Ticket>
}
