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
  declare category:
    | 'Technique & Maintenance'
    | 'Entretien & Nettoyage'
    | 'Administratifs & Contrats'
    | 'Finance & Facturation'
    | 'Relations & Conflits'
    | 'Gestion des accès'
    | 'Déménagement'
    | 'Urgences'

  @column()
  declare priority: 'basse' | 'moyenne' | 'élevée' | 'urgente'

  @column()
  declare status: 'ouvert' | 'assigné' | 'en cours' | 'résolu' | 'fermé'

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

  validateTicketWorkflow(): (ticket: Ticket) => boolean {
    return (ticket: Ticket) => {
      if (ticket.status === 'résolu' && !ticket.resolvedAt) {
        throw new Error('Un ticket résolu doit avoir une date de résolution (resolvedAt) définie.')
      }
      if (ticket.status !== 'résolu' && ticket.status !== 'fermé' && ticket.resolvedAt) {
        throw new Error(
          'La date de résolution ne peut être définie que pour des tickets résolus ou fermés.'
        )
      }
      const validTransitions: Record<string, string[]> = {
        'ouvert': ['assigné', 'fermé'],
        'assigné': ['en cours', 'fermé'],
        'en cours': ['résolu', 'fermé'],
        'résolu': ['fermé'],
        'fermé': [],
      }
      const previousStatus = ticket.$dirty.status ? ticket.$original.status : undefined
      if (
        previousStatus &&
        !validTransitions[previousStatus]?.includes(ticket.status) &&
        previousStatus !== ticket.status
      ) {
        throw new Error(
          `Transition d'état non autorisée: impossible de passer de "${previousStatus}" à "${ticket.status}".`
        )
      }
      return true
    }
  }
}
