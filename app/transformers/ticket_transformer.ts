import type Ticket from '#models/ticket'
import { BaseTransformer } from '@adonisjs/core/transformers'
import ProviderTransformer from './provider_transformer.js'
import TicketAttachmentTransformer from './ticket_attachment_transformer.js'
import TicketCommentTransformer from './ticket_comment_transformer.js'
import UnitTransformer from './unit_transformer.js'
import UserTransformer from './user_transformer.js'

export default class TicketTransformer extends BaseTransformer<Ticket> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'userId',
        'unitId',
        'providerId',
        'assignedTo',
        'reference',
        'category',
        'priority',
        'status',
        'title',
        'description',
        'createdAt',
      ]),

      unit: UnitTransformer.transform(this.whenLoaded(this.resource.unit)),

      user: UserTransformer.transform(this.whenLoaded(this.resource.user))?.useVariant(
        'forTicketUser'
      ),

      provider: ProviderTransformer.transform(this.whenLoaded(this.resource.provider)),

      assignee: UserTransformer.transform(this.whenLoaded(this.resource.assignee))?.useVariant(
        'forAssignee'
      ),

      comments: TicketCommentTransformer.transform(this.whenLoaded(this.resource.comments)),

      attachments: TicketAttachmentTransformer.transform(
        this.whenLoaded(this.resource.attachments)
      ),
    }
  }
}
