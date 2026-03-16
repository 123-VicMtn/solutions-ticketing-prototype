import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, computed, hasMany } from '@adonisjs/lucid/orm'
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

export type UserRole = 'tenant' | 'owner' | 'manager' | 'admin' | 'provider'
export type UserStatus = 'pending' | 'active' | 'rejected' | 'suspended'

const HIERARCHY: Exclude<UserRole, 'provider'>[] = ['tenant', 'owner', 'manager', 'admin']

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare role: UserRole

  @column()
  declare status: UserStatus

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string | null

  @column()
  declare phone: string | null

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare notificationPreference: 'email' | 'sms'

  @column({ serializeAs: null })
  declare inviteToken: string | null

  @column.dateTime({ serializeAs: null })
  declare inviteTokenExpiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => UserUnit)
  declare userUnits: HasMany<typeof UserUnit>

  @hasMany(() => Ticket, { foreignKey: 'userId' })
  declare tickets: HasMany<typeof Ticket>

  @hasMany(() => Ticket, { foreignKey: 'assignedTo' })
  declare assignedTickets: HasMany<typeof Ticket>

  @hasMany(() => TicketComment)
  declare ticketComments: HasMany<typeof TicketComment>

  @hasMany(() => TicketAttachment)
  declare ticketAttachments: HasMany<typeof TicketAttachment>

  @computed()
  get fullName() {
    if (this.firstName && this.lastName) return `${this.firstName} ${this.lastName}`
    if (this.firstName) return this.firstName
    return null
  }

  @computed()
  get initials() {
    if (this.firstName && this.lastName) {
      return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase()
    }
    if (this.firstName) return this.firstName.slice(0, 2).toUpperCase()
    return this.email?.slice(0, 2).toUpperCase() ?? null
  }

  get isProvider() {
    return this.role === 'provider'
  }

  get isActive() {
    return this.status === 'active'
  }

  get isPending() {
    return this.status === 'pending'
  }

  hasAtLeastRole(min: Exclude<UserRole, 'provider'>): boolean {
    if (this.isProvider) return false
    return HIERARCHY.indexOf(this.role as any) >= HIERARCHY.indexOf(min)
  }
}
