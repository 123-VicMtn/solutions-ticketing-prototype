import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UserUnit from '#models/user_unit'
import Ticket from '#models/ticket'
import TicketComment from '#models/ticket_comment'
import TicketAttachment from '#models/ticket_attachment'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare role: 'admin' | 'tenant' | 'owner'

  @column()
  declare firstName: string | null

  @column()
  declare lastName: string | null

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare notificationPreference: 'email' | 'sms'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => UserUnit)
  declare userUnits: HasMany<typeof UserUnit>

  @hasMany(() => Ticket)
  declare tickets: HasMany<typeof Ticket>

  @hasMany(() => TicketComment)
  declare ticketComments: HasMany<typeof TicketComment>

  @hasMany(() => TicketAttachment)
  declare ticketAttachments: HasMany<typeof TicketAttachment>

  get fullName() {
    if (this.firstName && this.lastName) return `${this.firstName} ${this.lastName}`
    if (this.firstName) return this.firstName
    return null
  }

  get initials() {
    if (this.firstName && this.lastName) {
      return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase()
    }
    if (this.firstName) {
      return this.firstName.slice(0, 2).toUpperCase()
    }
    return this.email.slice(0, 2).toUpperCase()
  }
}
