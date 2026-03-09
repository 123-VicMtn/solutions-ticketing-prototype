import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Unit from '#models/unit'
import TicketComment from './ticket_comment.js'
import TicketAttachment from './ticket_attachment.js'

export default class Ticket extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare unitId: number

  @column()
  declare reference: string | null

  @column()
  declare category: 'plumbing' | 'electricity' | 'heating' | 'general' | 'other'

  @column()
  declare priority: 'low' | 'medium' | 'high' | 'urgent'

  @column()
  declare status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'

  @column()
  declare title: string

  @column()
  declare description: string

  @column.dateTime()
  declare resolvedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Unit)
  declare unit: BelongsTo<typeof Unit>

  @hasMany(() => TicketComment)
  declare comments: HasMany<typeof TicketComment>

  @hasMany(() => TicketAttachment)
  declare attachments: HasMany<typeof TicketAttachment>
}
