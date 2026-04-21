import logger from '@adonisjs/core/services/logger'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import type Ticket from '#models/ticket'
import type Provider from '#models/provider'
import User from '#models/user'

export default class TicketNotifications {
  static async notifyProviderAssigned(ticket: Ticket, provider: Provider) {
    await ticket.load('user')
    await ticket.load('unit', (q) => q.preload('building'))
    await provider.load('user')

    const providerUser = provider.user
    if (!providerUser.email) {
      logger.warn({ providerId: provider.id }, 'Provider sans email : notification impossible')
      return
    }

    const ticketUrl = `${env.get('APP_URL')}/tickets/${ticket.id}`
    const platformUrl = env.get('APP_URL')

    const priorityLabels: Record<string, string> = {
      basse: 'Basse',
      moyenne: 'Moyenne',
      élevée: 'Élevée',
      urgente: 'Urgente',
    }

    const responseDelay = ticket.priority === 'urgente' ? '24 heures' : '48 heures'

    try {
      await mail.send((message) => {
        message
          .to(providerUser.email!)
          .subject(`Nouvelle mission — ${ticket.reference ?? `Ticket #${ticket.id}`}`)
          .htmlView('emails/provider_mission_request', {
            brandName: env.get('APP_NAME', '123-Solutions'),
            providerName: provider.companyName,
            ticketId: ticket.reference ?? `#${ticket.id}`,
            priority: priorityLabels[ticket.priority] ?? ticket.priority,
            serviceType: ticket.category,
            location: `${ticket.unit.building.name} — ${ticket.unit.label}`,
            requestedDate: ticket.createdAt.toFormat('dd/MM/yyyy'),
            requesterName:
              ticket.user.fullName ?? `${ticket.user.firstName} ${ticket.user.lastName}`,
            requesterEmail: ticket.user.email ?? '-',
            description: ticket.description,
            ticketUrl,
            platformUrl,
            responseDelay,
          })
      })
    } catch (error) {
      logger.error(
        { err: error, ticketId: ticket.id },
        'Échec envoi notification assignation provider'
      )
    }
  }

  static async notifyInternalAssigneeTicketCompleted(ticket: Ticket) {
    await ticket.load('unit', (q) => q.preload('building'))
    await ticket.load('provider')

    if (!ticket.assignedTo) {
      logger.warn({ ticketId: ticket.id }, 'Ticket sans suivi interne : notification impossible')
      return
    }

    const assignee = await User.find(ticket.assignedTo)
    if (!assignee) {
      logger.warn({ ticketId: ticket.id, assignedTo: ticket.assignedTo }, 'Suivi interne introuvable')
      return
    }

    if (!assignee.email) {
      logger.warn({ ticketId: ticket.id, assigneeId: assignee.id }, 'Suivi interne sans email')
      return
    }

    const providerName = ticket.provider?.companyName ?? 'Prestataire'
    const ticketUrl = `${env.get('APP_URL')}/tickets/${ticket.id}`
    const platformUrl = env.get('APP_URL')

    try {
      await mail.send((message) => {
        message
          .to(assignee.email!)
          .subject(`Intervention terminée — ${ticket.reference ?? `Ticket #${ticket.id}`}`)
          .htmlView('emails/ticket_completed_internal', {
            brandName: env.get('APP_NAME', '123-Solutions'),
            assigneeName: assignee.fullName ?? assignee.firstName,
            providerName,
            ticketId: ticket.reference ?? `#${ticket.id}`,
            statusLabel: 'Terminé',
            category: ticket.category,
            location: `${ticket.unit.building.name} — ${ticket.unit.label}`,
            title: ticket.title,
            ticketUrl,
            platformUrl,
          })
      })
    } catch (error) {
      logger.error({ err: error, ticketId: ticket.id }, 'Échec envoi email ticket terminé au suivi interne')
    }
  }
}
