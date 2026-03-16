import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Unit from '#models/unit'
import Provider from '#models/provider'
import TicketComment from '#models/ticket_comment'
import TicketAttachment from '#models/ticket_attachment'

export type TicketStatus = 'ouvert' | 'assigné' | 'en cours' | 'terminé' | 'résolu' | 'fermé'

export type TicketCategory =
  | 'Technique & Maintenance'
  | 'Entretien & Nettoyage'
  | 'Administratifs & Contrats'
  | 'Finance & Facturation'
  | 'Relations & Conflits'
  | 'Gestion des accès'
  | 'Déménagement'
  | 'Urgences'

export type TicketPriority = 'basse' | 'moyenne' | 'élevée' | 'urgente'

const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  'ouvert': ['assigné', 'fermé'],
  'assigné': ['en cours', 'fermé'],
  'en cours': ['terminé', 'fermé'],
  'terminé': ['résolu', 'fermé'],
  'résolu': ['fermé'],
  'fermé': [],
}

export const PROVIDER_ALLOWED_TRANSITIONS: TicketStatus[] = ['en cours', 'terminé']

export default class Ticket extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare unitId: number

  @column()
  declare providerId: number | null

  @column()
  declare assignedTo: number | null

  @column()
  declare reference: string | null

  @column()
  declare category: TicketCategory

  @column()
  declare priority: TicketPriority

  @column()
  declare status: TicketStatus

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

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'assignedTo' })
  declare assignee: BelongsTo<typeof User>

  @belongsTo(() => Unit)
  declare unit: BelongsTo<typeof Unit>

  @belongsTo(() => Provider)
  declare provider: BelongsTo<typeof Provider>

  @hasMany(() => TicketComment)
  declare comments: HasMany<typeof TicketComment>

  @hasMany(() => TicketAttachment)
  declare attachments: HasMany<typeof TicketAttachment>

  @beforeSave()
  static validateWorkflow(ticket: Ticket) {
    if (ticket.$dirty.status) {
      if (ticket.status === 'résolu' && !ticket.resolvedAt) {
        ticket.resolvedAt = DateTime.now()
      }
      if (ticket.status !== 'résolu' && ticket.status !== 'fermé') {
        ticket.resolvedAt = null
      }

      const prev = ticket.$original.status as TicketStatus | undefined
      if (prev && prev !== ticket.status) {
        const allowed = VALID_TRANSITIONS[prev] ?? []
        if (!allowed.includes(ticket.status)) {
          throw new Error(`Transition non autorisée : "${prev}" → "${ticket.status}"`)
        }
      }
    }
  }
}
