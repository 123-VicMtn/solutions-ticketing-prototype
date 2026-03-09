import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Building from '#models/building'
import UserUnit from '#models/user_unit'

export default class Unit extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare buildingId: number

  @column()
  declare label: string

  @column()
  declare floor: number

  @column()
  declare type: 'apartment' | 'commercial' | 'parking' | 'storage'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Building)
  declare building: BelongsTo<typeof Building>

  @hasMany(() => UserUnit)
  declare userUnits: HasMany<typeof UserUnit>
}
