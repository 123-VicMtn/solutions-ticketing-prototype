import Ticket, { PROVIDER_ALLOWED_TRANSITIONS, VALID_TRANSITIONS } from '#models/ticket'
import Unit from '#models/unit'
import UserUnit from '#models/user_unit'
import Provider from '#models/provider'
import User from '#models/user'
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
import { TicketAttachmentValidationService } from '#services/ticket_attachment_validation_service'
import {
  AttachmentStorageProviderError,
  AttachmentStorageService,
} from '#services/attachment_storage_service'
import TicketNotifications from '#services/ticket_notification_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { MultipartFile } from '@adonisjs/bodyparser/types'
import type { UserRole } from '#models/user'
import type { TicketStatus } from '#models/ticket'
import { DateTime } from 'luxon'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const ticketAttachmentValidationService = new TicketAttachmentValidationService()
const attachmentStorageService = new AttachmentStorageService()

export default class TicketsController {
  async index({ inertia, auth, request }: HttpContext) {
    const user = auth.user!
    const filters = {
      status: request.input('status') as string | undefined,
      priority: request.input('priority') as string | undefined,
      category: request.input('category') as string | undefined,
      assignedTo: request.input('assignedTo') as string | undefined,
    }

    const canAssign = user.hasAtLeastRole('manager')
    const assignees = canAssign
      ? await User.query()
          .whereIn('role', ['manager', 'admin'])
          .where('status', 'active')
          .orderBy('first_name')
          .orderBy('last_name')
      : []

    const query = Ticket.query()
      .preload('unit', (q) => q.preload('building'))
      .preload('user')
      .preload('assignee')
      .orderBy('id', 'desc')

    switch (user.role) {
      case 'admin':
      case 'manager':
        break

      case 'provider':
        query.whereHas('provider', (q) => q.where('userId', user.id))
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
    if (filters.category) query.where('category', filters.category)
    if (filters.assignedTo) {
      if (filters.assignedTo === 'me') {
        query.where('assignedTo', user.id)
      } else if (user.hasAtLeastRole('manager')) {
        const maybeId = Number(filters.assignedTo)
        if (!Number.isNaN(maybeId) && Number.isFinite(maybeId)) {
          query.where('assignedTo', maybeId)
        }
      }
    }

    const tickets = await query

    return inertia.render('tickets/index', {
      tickets: TicketTransformer.transform(tickets),
      filters,
      assignees: assignees.map((u) => ({ id: u.id, fullName: u.fullName })),
    } as any)
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
    const attachments = request.files('attachments')
    const attachmentsError = ticketAttachmentValidationService.validate(attachments, {
      required: false,
    })
    if (attachmentsError) {
      session.flash('inputErrorsBag', { attachments: [attachmentsError] })
      return response.redirect().back()
    }

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

    try {
      await this.processAttachments(attachments, ticket.id, user.id)
    } catch (error) {
      if (error instanceof AttachmentStorageProviderError) {
        session.flash(
          'error',
          'Le service de stockage des pièces jointes est temporairement indisponible. Réessayez dans quelques instants.'
        )
        await ticket.delete()
        return response.redirect().back()
      }
      throw error
    }

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

    const workflowNextStatuses = VALID_TRANSITIONS[ticket.status] ?? []
    const hasAssignee = Boolean(ticket.assignedTo)

    const allowedStatusTransitions = canChangeStatus
      ? user.role === 'provider'
        ? (() => {
            const next: TicketStatus[] = []
            if (ticket.status === 'assigné') next.push('en cours')
            if (ticket.status === 'en cours') next.push('terminé')
            return next
          })().filter((s) => PROVIDER_ALLOWED_TRANSITIONS.includes(s))
        : workflowNextStatuses.filter((s) => {
            if (s === 'assigné' && !hasAssignee) return false
            return true
          })
      : []

    const providers = canAssign
      ? await Provider.query().where('isActive', true).orderBy('companyName')
      : []

    const internalAssignees = canAssign
      ? await User.query()
          .whereIn('role', ['manager', 'admin'])
          .where('status', 'active')
          .orderBy('first_name')
          .orderBy('last_name')
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
      assignees: internalAssignees.map((u) => ({ id: u.id, fullName: u.fullName })),
    } as any)
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
    const previousStatus = ticket.status

    if (!(await this.canAccessTicket(user.id, user.role, ticket))) {
      return response.abort('Non autorisé', 403)
    }

    if (user.role === 'provider') {
      const current = ticket.status
      const next = payload.status

      const isAllowedProviderTransition =
        (current === 'assigné' && next === 'en cours') ||
        (current === 'en cours' && next === 'terminé')

      if (!isAllowedProviderTransition || !PROVIDER_ALLOWED_TRANSITIONS.includes(next)) {
        session.flash('error', 'Transition non autorisée pour un prestataire')
        return response.redirect().toPath(`/tickets/${ticket.id}`)
      }
    } else if (!user.hasAtLeastRole('manager')) {
      return response.abort('Non autorisé', 403)
    }

    if (payload.status === 'assigné') {
      const hasAssignee = Boolean(ticket.assignedTo)
      if (!hasAssignee) {
        session.flash(
          'error',
          'Impossible de passer à "assigné" : aucune assignation (interne ou prestataire) n\'est définie.'
        )
        return response.redirect().toPath(`/tickets/${ticket.id}`)
      }
    }

    ticket.status = payload.status
    try {
      await ticket.save()
    } catch (error) {
      session.flash('error', error instanceof Error ? error.message : 'Transition non autorisée')
      return response.redirect().toPath(`/tickets/${ticket.id}`)
    }

    if (user.role === 'provider' && previousStatus === 'en cours' && ticket.status === 'terminé') {
      await TicketNotifications.notifyInternalAssigneeTicketCompleted(ticket)
    }

    session.flash('success', 'Statut mis à jour')
    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  async assign({ request, response, params, auth, session }: HttpContext) {
    const user = auth.user!

    if (!user.hasAtLeastRole('manager')) {
      return response.abort('Non autorisé', 403)
    }

    const payload = await request.validateUsing(assignTicketValidator)

    const ticket = await Ticket.findOrFail(params.id)

    const assignee = await User.findOrFail(payload.assigneeUserId)

    if (!assignee.isActive) {
      session.flash('error', "Cet utilisateur n'est pas actif")
      return response.redirect().toPath(`/tickets/${params.id}`)
    }

    if (assignee.role === 'provider') {
      session.flash('error', "Impossible d'assigner le suivi interne à un compte prestataire")
      return response.redirect().toPath(`/tickets/${params.id}`)
    }

    if (!assignee.hasAtLeastRole('manager')) {
      session.flash('error', 'Seuls les comptes gérance peuvent être assignés au suivi interne')
      return response.redirect().toPath(`/tickets/${params.id}`)
    }

    ticket.assignedTo = assignee.id

    let assignedProvider: Provider | null = null
    if (payload.providerId) {
      const provider = await Provider.findOrFail(payload.providerId)
      if (!provider.isActive) {
        session.flash('error', "Ce prestataire n'est pas actif")
        return response.redirect().toPath(`/tickets/${params.id}`)
      }
      ticket.providerId = provider.id
      assignedProvider = provider
    } else {
      ticket.providerId = null
    }

    if (ticket.status === 'ouvert') {
      ticket.status = 'assigné'
    }

    await ticket.save()

    if (assignedProvider) {
      await TicketNotifications.notifyProviderAssigned(ticket, assignedProvider)
    }

    session.flash(
      'success',
      assignedProvider
        ? `Ticket assigné (suivi interne: ${assignee.fullName ?? '—'}) et prestataire: ${assignedProvider.companyName}`
        : `Ticket assigné (suivi interne: ${assignee.fullName ?? '—'}) sans prestataire`
    )
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

    const attachments = request.files('attachments')
    const attachmentsError = ticketAttachmentValidationService.validate(attachments, {
      required: true,
    })
    if (attachmentsError) {
      session.flash('inputErrorsBag', { attachments: [attachmentsError] })
      return response.redirect().toPath(`/tickets/${ticket.id}`)
    }

    let count = 0
    try {
      count = await this.processAttachments(attachments, ticket.id, user.id)
    } catch (error) {
      if (error instanceof AttachmentStorageProviderError) {
        session.flash(
          'error',
          'Le service de stockage des pièces jointes est temporairement indisponible. Réessayez dans quelques instants.'
        )
        return response.redirect().toPath(`/tickets/${ticket.id}`)
      }
      throw error
    }
    if (count === 0) {
      session.flash('error', 'Aucun fichier valide envoyé')
    } else {
      session.flash('success', `${count} fichier(s) ajouté(s)`)
    }

    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  async readAttachment({ params, auth, response }: HttpContext) {
    const ticketId = Number(params.id)
    const attachmentId = Number(params.attachmentId)
    if (!Number.isFinite(ticketId) || !Number.isFinite(attachmentId)) {
      return response.notFound()
    }
    const ticket = await Ticket.findOrFail(ticketId)
    const user = auth.user!
    if (!(await this.canAccessTicket(user.id, user.role, ticket))) {
      return response.abort('Non autorisé', 403)
    }
    const attachment = await TicketAttachment.query()
      .where('ticketId', ticket.id)
      .where('id', attachmentId)
      .firstOrFail()

    if (!attachment.storageKey) {
      return response.notFound()
    }

    try {
      const readUrl = await attachmentStorageService.getReadUrl(attachment.storageKey)
      return response.redirect().toPath(readUrl)
    } catch (error) {
      if (error instanceof AttachmentStorageProviderError) {
        return response.serviceUnavailable({
          message:
            'Le service de stockage est temporairement indisponible. Réessayez dans quelques instants.',
        })
      }
      return response.notFound()
    }
  }

  private async canAccessTicket(userId: number, role: UserRole, ticket: Ticket): Promise<boolean> {
    if (role === 'admin' || role === 'manager') return true
    if (role === 'provider') {
      const provider = await Provider.query().where('userId', userId).select(['id']).first()
      if (!provider) return false
      return ticket.providerId === provider.id
    }
    if (ticket.userId === userId) return true

    const userUnit = await UserUnit.query()
      .where('userId', userId)
      .where('unitId', ticket.unitId)
      .first()
    return Boolean(userUnit)
  }

  private async processAttachments(
    attachments: MultipartFile[],
    ticketId: number,
    userId: number
  ): Promise<number> {
    let count = 0

    for (const attachment of attachments) {
      const checksumSha256 = await this.computeSha256(attachment)
      const storedAttachment = await attachmentStorageService.upload(attachment)
      await TicketAttachment.create({
        ticketId,
        userId,
        filePath: null,
        storageDriver: storedAttachment.storageDriver,
        storageKey: storedAttachment.storageKey,
        checksumSha256,
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

  private async computeSha256(attachment: MultipartFile): Promise<string | null> {
    if (!attachment.tmpPath) {
      return null
    }

    const content = await readFile(attachment.tmpPath)
    return createHash('sha256').update(content).digest('hex')
  }
}
