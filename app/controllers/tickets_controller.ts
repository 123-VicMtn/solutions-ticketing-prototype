import app from '@adonisjs/core/services/app'
import Ticket, { PROVIDER_ALLOWED_TRANSITIONS, VALID_TRANSITIONS } from '#models/ticket'
import Unit from '#models/unit'
import UserUnit from '#models/user_unit'
import Provider from '#models/provider'
import TicketComment from '#models/ticket_comment'
import TicketAttachment from '#models/ticket_attachment'
import ProviderTransformer from '#transformers/provider_transformer'
import TicketAttachmentTransformer from '#transformers/ticket_attachment_transformer'
import TicketCommentTransformer from '#transformers/ticket_comment_transformer'
import TicketTransformer from '#transformers/ticket_transformer'
import UnitTransformer from '#transformers/unit_transformer'
import {
  commentTicketValidator,
  createTicketValidator,
  statusTicketValidator,
  updateTicketValidator,
  assignTicketValidator,
} from '#validators/ticket'
import TicketNotifications from '#services/ticket_notification_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { UserRole } from '#models/user'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class TicketsController {
  async index({ inertia, auth, request }: HttpContext) {
    const user = auth.user!
    const filters = {
      status: request.input('status') as string | undefined,
      priority: request.input('priority') as string | undefined,
    }

    const query = Ticket.query()
      .preload('unit', (q) => q.preload('building'))
      .preload('user')
      .orderBy('id', 'desc')

    switch (user.role) {
      case 'admin':
      case 'manager':
        break

      case 'provider':
        query.where('assignedTo', user.id)
        break

      case 'owner': {
        const userUnitRows = await UserUnit.query().where('userId', user.id).select('unitId')
        const unitIds = userUnitRows.map((row) => row.unitId)

        query.where((q) => {
          q.where('userId', user.id)
          if (unitIds.length > 0) {
            q.orWhereIn('unitId', unitIds)
          }
        })
        break
      }

      default:
        query.where('userId', user.id)
        break
    }

    if (filters.status) query.where('status', filters.status)
    if (filters.priority) query.where('priority', filters.priority)

    const tickets = await query

    return inertia.render('tickets/index', {
      tickets: TicketTransformer.transform(tickets),
      filters,
    })
  }

  async create({ inertia, auth }: HttpContext) {
    const user = auth.user!
    if (!this.canCreateTickets(user.role)) {
      return inertia.render('errors/forbidden', {})
    }
    let units: Unit[] = []
    const canModifyPriority = user.hasAtLeastRole('manager')

    if (canModifyPriority) {
      units = await Unit.query().preload('building').orderBy('building_id').orderBy('label')
    } else {
      const userUnits = await UserUnit.query()
        .where('userId', user.id)
        .preload('unit', (q) => q.preload('building'))
      units = userUnits.map((item) => item.unit)
    }

    return inertia.render('tickets/create', {
      canModifyPriority,
      units: UnitTransformer.transform(units),
    })
  }

  async store({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    if (!this.canCreateTickets(user.role)) {
      return response.abort('Non autorisé', 403)
    }

    const payload = await request.validateUsing(createTicketValidator)

    const ticket = await Ticket.create({
      userId: user.id,
      unitId: payload.unitId,
      category: payload.category,
      priority: payload.priority ?? 'moyenne',
      status: 'ouvert',
      title: payload.title,
      description: payload.description,
    })

    ticket.reference = `TK-${DateTime.now().year}-${String(ticket.id).padStart(4, '0')}`
    await ticket.save()

    await this.processAttachments(request, ticket.id, user.id)

    session.flash('success', 'Ticket créé avec succès')
    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  async show({ inertia, params, auth, response }: HttpContext) {
    const ticket = await Ticket.query()
      .where('id', params.id)
      .preload('unit', (q) => q.preload('building'))
      .preload('user')
      .preload('provider')
      .preload('assignee')
      .preload('comments', (q) => q.preload('user').orderBy('createdAt', 'asc'))
      .preload('attachments', (q) => q.preload('user').orderBy('createdAt', 'desc'))
      .firstOrFail()

    const user = auth.user!
    if (!(await this.canAccessTicket(user.id, user.role, ticket))) {
      return response.abort('Non autorisé', 403)
    }

    const canSeeInternal = user.hasAtLeastRole('manager')
    const visibleComments = canSeeInternal
      ? ticket.comments
      : ticket.comments.filter((c) => !c.isInternal)

    const canEditFields = ticket.userId === user.id || user.hasAtLeastRole('manager')
    const canChangeStatus = user.hasAtLeastRole('manager') || user.role === 'provider'
    const canAssign = user.hasAtLeastRole('manager')

    // Autorise uniquement les transitions correspondant au workflow, et restreint
    // celles autorisées au rôle "provider".
    const workflowNextStatuses = VALID_TRANSITIONS[ticket.status] ?? []
    const hasAssignedProvider = Boolean(ticket.providerId && ticket.assignedTo)

    const allowedStatusTransitions = canChangeStatus
      ? user.role === 'provider'
        ? workflowNextStatuses.filter((s) => PROVIDER_ALLOWED_TRANSITIONS.includes(s))
        : workflowNextStatuses.filter((s) => {
            if (s === 'assigné' && !hasAssignedProvider) return false
            return true
          })
      : []

    const providers = canAssign
      ? await Provider.query().where('isActive', true).orderBy('companyName')
      : []

    return inertia.render('tickets/show', {
      ticket: TicketTransformer.transform(ticket),
      comments: TicketCommentTransformer.transform(visibleComments),
      attachments: TicketAttachmentTransformer.transform(ticket.attachments),
      canSeeInternal,
      canEditFields,
      canChangeStatus,
      allowedStatusTransitions,
      canAssign,
      providers: ProviderTransformer.transform(providers),
    })
  }

  async edit({ inertia, params, auth, response }: HttpContext) {
    const user = auth.user!
    const ticket = await Ticket.query()
      .where('id', params.id)
      .preload('unit', (q) => q.preload('building'))
      .firstOrFail()

    if (!(await this.canAccessTicket(user.id, user.role, ticket))) {
      return response.abort('Non autorisé', 403)
    }

    const isCreator = ticket.userId === user.id
    const isManagerOrAbove = user.hasAtLeastRole('manager')

    if (!isCreator && !isManagerOrAbove) {
      return response.abort('Non autorisé', 403)
    }

    return inertia.render('tickets/edit', {
      ticket: TicketTransformer.transform(ticket),
      canModifyPriority: isManagerOrAbove,
    })
  }

  async update({ request, response, params, auth, session }: HttpContext) {
    const user = auth.user!
    const ticket = await Ticket.findOrFail(params.id)

    if (!(await this.canAccessTicket(user.id, user.role, ticket))) {
      return response.abort('Non autorisé', 403)
    }

    const isCreator = ticket.userId === user.id
    const isManagerOrAbove = user.hasAtLeastRole('manager')

    if (!isCreator && !isManagerOrAbove) {
      return response.abort('Non autorisé', 403)
    }

    const payload = await request.validateUsing(updateTicketValidator)

    if (payload.title) ticket.title = payload.title
    if (payload.description) ticket.description = payload.description
    if (payload.priority && isManagerOrAbove) ticket.priority = payload.priority

    await ticket.save()

    session.flash('success', 'Ticket mis à jour')
    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  async updateStatus({ request, response, params, auth, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(statusTicketValidator)
    const ticket = await Ticket.findOrFail(params.id)

    if (!(await this.canAccessTicket(user.id, user.role, ticket))) {
      return response.abort('Non autorisé', 403)
    }

    if (user.role === 'provider') {
      if (ticket.assignedTo !== user.id) {
        return response.abort('Non autorisé', 403)
      }
      if (!PROVIDER_ALLOWED_TRANSITIONS.includes(payload.status)) {
        session.flash('error', 'Transition non autorisée pour un prestataire')
        return response.redirect().toPath(`/tickets/${ticket.id}`)
      }
    } else if (!user.hasAtLeastRole('manager')) {
      return response.abort('Non autorisé', 403)
    }

    if (payload.status === 'assigné') {
      const hasAssignedProvider = Boolean(ticket.providerId && ticket.assignedTo)
      if (!hasAssignedProvider) {
        session.flash(
          'error',
          'Impossible de passer à "assigné" : aucun prestataire n\'est assigné.'
        )
        return response.redirect().toPath(`/tickets/${ticket.id}`)
      }
    }

    ticket.status = payload.status
    await ticket.save()

    session.flash('success', 'Statut mis à jour')
    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  async assign({ request, response, params, auth, session }: HttpContext) {
    const user = auth.user!

    if (!user.hasAtLeastRole('manager')) {
      return response.abort('Non autorisé', 403)
    }

    const payload = await request.validateUsing(assignTicketValidator)
    const provider = await Provider.findOrFail(payload.providerId)

    if (!provider.isActive) {
      session.flash('error', "Ce prestataire n'est pas actif")
      return response.redirect().toPath(`/tickets/${params.id}`)
    }

    const ticket = await Ticket.findOrFail(params.id)

    ticket.providerId = provider.id
    ticket.assignedTo = provider.userId

    if (ticket.status === 'ouvert') {
      ticket.status = 'assigné'
    }

    await ticket.save()

    await TicketNotifications.notifyProviderAssigned(ticket, provider)

    session.flash('success', `Ticket assigné à ${provider.companyName}`)
    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  async addComment({ request, response, params, auth, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(commentTicketValidator)
    const ticket = await Ticket.findOrFail(params.id)

    if (!(await this.canAccessTicket(user.id, user.role, ticket))) {
      return response.abort('Non autorisé', 403)
    }

    await TicketComment.create({
      ticketId: ticket.id,
      userId: user.id,
      content: payload.content,
      isInternal: user.hasAtLeastRole('manager') ? Boolean(payload.isInternal) : false,
    })

    session.flash('success', 'Commentaire ajouté')
    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  async addAttachments({ request, response, params, auth, session }: HttpContext) {
    const user = auth.user!
    const ticket = await Ticket.findOrFail(params.id)

    if (!(await this.canAccessTicket(user.id, user.role, ticket))) {
      return response.abort('Non autorisé', 403)
    }

    const count = await this.processAttachments(request, ticket.id, user.id)
    if (count === 0) {
      session.flash('error', 'Aucun fichier valide envoyé')
    } else {
      session.flash('success', `${count} fichier(s) ajouté(s)`)
    }

    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  private async canAccessTicket(userId: number, role: UserRole, ticket: Ticket): Promise<boolean> {
    if (role === 'admin' || role === 'manager') return true
    if (role === 'provider') return ticket.assignedTo === userId
    if (ticket.userId === userId) return true

    const userUnit = await UserUnit.query()
      .where('userId', userId)
      .where('unitId', ticket.unitId)
      .first()
    return Boolean(userUnit)
  }

  private async processAttachments(
    request: HttpContext['request'],
    ticketId: number,
    userId: number
  ): Promise<number> {
    const attachments = request.files('attachments')
    let count = 0

    for (const attachment of attachments) {
      if (!attachment.isValid) continue
      const filename = `${randomUUID()}.${attachment.extname ?? 'bin'}`
      await attachment.move(app.makePath('public/uploads/tickets'), { name: filename })
      await TicketAttachment.create({
        ticketId,
        userId,
        filePath: `/uploads/tickets/${filename}`,
        originalName: attachment.clientName,
        mimeType: attachment.type ?? 'application/octet-stream',
        sizeBytes: attachment.size,
      })
      count++
    }

    return count
  }

  private canCreateTickets(role: UserRole): boolean {
    return role !== 'provider'
  }
}
