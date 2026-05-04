import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Ticket from '#models/ticket'
import User from '#models/user'

export default class TicketAttachment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare ticketId: number

  @column()
  declare userId: number

  @column()
  declare filePath: string | null

  @column()
  declare storageDriver: string | null

  @column()
  declare storageKey: string | null

  @column({ columnName: 'checksum_sha256' })
  declare checksumSha256: string | null

  @column()
  declare originalName: string

  @column()
  declare mimeType: string

  @column()
  declare sizeBytes: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Ticket)
  declare ticket: BelongsTo<typeof Ticket>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
