import type TicketAttachment from '#models/ticket_attachment'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TicketAttachmentTransformer extends BaseTransformer<TicketAttachment> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'ticketId',
      'userId',
      'filePath',
      'originalName',
      'mimeType',
      'sizeBytes',
      'createdAt',
    ])
  }
}
