import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Ticket from '#models/ticket'
import User from '#models/user'

export default class TicketComment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare ticketId: number

  @column()
  declare userId: number

  @column()
  declare content: string

  @column()
  declare isInternal: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Ticket)
  declare ticket: BelongsTo<typeof Ticket>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
