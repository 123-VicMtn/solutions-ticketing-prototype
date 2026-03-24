import logger from '@adonisjs/core/services/logger'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import type Ticket from '#models/ticket'
import type Provider from '#models/provider'

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
}
