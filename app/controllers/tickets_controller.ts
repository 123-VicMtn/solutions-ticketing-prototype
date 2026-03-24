import app from '@adonisjs/core/services/app'
import Ticket, { PROVIDER_ALLOWED_TRANSITIONS } from '#models/ticket'
import Unit from '#models/unit'
import UserUnit from '#models/user_unit'
import Provider from '#models/provider'
import TicketComment from '#models/ticket_comment'
import TicketAttachment from '#models/ticket_attachment'
import {
  commentTicketValidator,
  createTicketValidator,
  statusTicketValidator,
  updateTicketValidator,
} from '#validators/ticket'
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
      tickets: tickets.map((ticket) => ({
        id: ticket.id,
        reference: ticket.reference,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        title: ticket.title,
        createdAt: ticket.createdAt.toISO() ?? '',
        unit: {
          id: ticket.unit.id,
          label: ticket.unit.label,
          building: {
            id: ticket.unit.building.id,
            name: ticket.unit.building.name,
          },
        },
        user: {
          id: ticket.user.id,
          fullName: ticket.user.fullName,
          email: ticket.user.email ?? '-',
        },
      })),
      filters,
    })
  }

  async create({ inertia, auth }: HttpContext) {
    const user = auth.user!
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
      units: units.map((unit) => ({
        id: unit.id,
        label: unit.label,
        type: unit.type,
        building: {
          id: unit.building.id,
          name: unit.building.name,
        },
      })),
    })
  }

  async store({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
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

    const providerRows = canAssign
      ? await Provider.query().where('isActive', true).orderBy('companyName')
      : []

    const providers = providerRows.map((p) => ({
      id: p.id,
      companyName: p.companyName,
      speciality: p.speciality,
    }))

    return inertia.render('tickets/show', {
      ticket: {
        id: ticket.id,
        reference: ticket.reference,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        title: ticket.title,
        description: ticket.description,
        unit: {
          label: ticket.unit.label,
          building: { name: ticket.unit.building.name },
        },
        user: {
          id: ticket.user.id,
          fullName: ticket.user.fullName,
          email: ticket.user.email ?? '-',
          phone: ticket.user.phone ?? '-',
          role: ticket.user.role,
          notificationPreference: ticket.user.notificationPreference,
        },
        provider: ticket.provider
          ? {
              companyName: ticket.provider.companyName,
              phone: ticket.provider.phone ?? '',
              speciality: ticket.provider.speciality,
            }
          : null,
        assignee: ticket.assignee
          ? {
              id: ticket.assignee.id,
              fullName: ticket.assignee.fullName,
            }
          : null,
      },
      comments: visibleComments.map((comment) => ({
        id: comment.id,
        userId: comment.userId,
        content: comment.content,
        isInternal: comment.isInternal,
        createdAt: comment.createdAt.toISO() ?? '',
        user: {
          id: comment.user.id,
          fullName: comment.user.fullName,
          email: comment.user.email ?? '-',
        },
      })),
      attachments: ticket.attachments.map((attachment) => ({
        id: attachment.id,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        filePath: attachment.filePath,
        createdAt: attachment.createdAt.toISO() ?? '',
      })),
      canSeeInternal,
      canEditFields,
      canChangeStatus,
      canAssign,
      providers,
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
      ticket: {
        id: ticket.id,
        reference: ticket.reference,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        category: ticket.category,
        unit: {
          label: ticket.unit.label,
          building: { name: ticket.unit.building.name },
        },
      },
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

    const ticket = await Ticket.findOrFail(params.id)
    const providerId = request.input('providerId')
    const provider = await Provider.findOrFail(providerId)

    ticket.providerId = provider.id
    ticket.assignedTo = provider.userId

    if (ticket.status === 'ouvert') {
      ticket.status = 'assigné'
    }

    await ticket.save()

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
}
