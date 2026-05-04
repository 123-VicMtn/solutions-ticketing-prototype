import type TicketAttachment from '#models/ticket_attachment'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TicketAttachmentTransformer extends BaseTransformer<TicketAttachment> {
  toObject() {
    const payload = this.pick(this.resource, [
      'id',
      'ticketId',
      'userId',
      'originalName',
      'mimeType',
      'sizeBytes',
      'createdAt',
    ])

    return {
      ...payload,
      readUrl: `/tickets/${this.resource.ticketId}/attachments/${this.resource.id}/read`,
    }
  }
}
