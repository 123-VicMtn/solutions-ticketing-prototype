import app from '@adonisjs/core/services/app'
import Ticket from '#models/ticket'
import Unit from '#models/unit'
import UserUnit from '#models/user_unit'
import TicketComment from '#models/ticket_comment'
import TicketAttachment from '#models/ticket_attachment'
import {
  commentTicketValidator,
  createTicketValidator,
  statusTicketValidator,
} from '#validators/ticket'
import type { HttpContext } from '@adonisjs/core/http'
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

    if (user.role !== 'admin') {
      query.where('userId', user.id)
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
      isAdmin: user.role === 'admin',
    })
  }

  async create({ inertia, auth }: HttpContext) {
    const user = auth.user!
    let units: Unit[] = []

    if (user.role === 'admin') {
      units = await Unit.query().preload('building').orderBy('building_id').orderBy('label')
    } else {
      const userUnits = await UserUnit.query()
        .where('userId', user.id)
        .preload('unit', (query) => query.preload('building'))
      units = userUnits.map((item) => item.unit)
    }

    return inertia.render('tickets/create', {
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

  async store({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(createTicketValidator)

    const ticket = await Ticket.create({
      userId: user.id,
      unitId: payload.unitId,
      category: payload.category,
      priority: payload.priority,
      status: 'ouvert',
      title: payload.title,
      description: payload.description,
    })

    ticket.reference = `TK-${DateTime.now().year}-${String(ticket.id).padStart(4, '0')}`
    await ticket.save()

    const attachments = request.files('attachments')
    for (const attachment of attachments) {
      if (!attachment.isValid) continue
      const filename = `${randomUUID()}.${attachment.extname ?? 'bin'}`
      await attachment.move(app.makePath('public/uploads/tickets'), { name: filename })
      await TicketAttachment.create({
        ticketId: ticket.id,
        userId: user.id,
        filePath: `/uploads/tickets/${filename}`,
        originalName: attachment.clientName,
        mimeType: attachment.type ?? 'application/octet-stream',
        sizeBytes: attachment.size,
      })
    }

    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  async show({ inertia, params, auth, response }: HttpContext) {
    const ticket = await Ticket.query()
      .where('id', params.id)
      .preload('unit', (query) => query.preload('building'))
      .preload('user')
      .preload('comments', (query) => query.preload('user').orderBy('created_at', 'asc'))
      .preload('attachments', (query) => query.preload('user').orderBy('created_at', 'desc'))
      .firstOrFail()

    const user = auth.user!
    const canAccess = await this.canAccessTicket(user.id, user.role, ticket)
    if (!canAccess) return response.abort('Not allowed', 403)

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
          building: {
            name: ticket.unit.building.name,
          },
        },
        user: {
          id: ticket.user.id,
          fullName: ticket.user.fullName,
          email: ticket.user.email ?? '-',
          phone: ticket.user.phone ?? '-',
          role: ticket.user.role,
          notificationPreference: ticket.user.notificationPreference,
        },
      },
      comments: ticket.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        isInternal: comment.isInternal,
        createdAt: comment.createdAt.toISO() ?? '',
        user: {
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
      isAdmin: user.role === 'admin',
    })
  }

  async addComment({ request, response, params, auth }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(commentTicketValidator)
    const ticket = await Ticket.findOrFail(params.id)

    const canAccess = await this.canAccessTicket(user.id, user.role, ticket)
    if (!canAccess) return response.abort('Not allowed', 403)

    await TicketComment.create({
      ticketId: ticket.id,
      userId: user.id,
      content: payload.content,
      isInternal: user.role === 'admin' ? Boolean(payload.isInternal) : false,
    })

    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  async updateStatus({ request, response, params, auth }: HttpContext) {
    const user = auth.user!
    if (user.role !== 'admin') return response.abort('Not allowed', 403)

    const payload = await request.validateUsing(statusTicketValidator)
    const ticket = await Ticket.findOrFail(params.id)

    ticket.status = payload.status
    ticket.resolvedAt = ticket.status === 'résolu' ? DateTime.now() : null
    await ticket.save()

    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  private async canAccessTicket(
    userId: number,
    role: 'admin' | 'tenant' | 'owner',
    ticket: Ticket
  ): Promise<boolean> {
    if (role === 'admin') return true
    if (ticket.userId === userId) return true

    const userUnit = await UserUnit.query()
      .where('userId', userId)
      .where('unitId', ticket.unitId)
      .first()
    return Boolean(userUnit)
  }
}
