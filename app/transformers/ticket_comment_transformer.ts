import type TicketComment from '#models/ticket_comment'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from './user_transformer.js'

export default class TicketCommentTransformer extends BaseTransformer<TicketComment> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'ticketId',
        'userId',
        'content',
        'isInternal',
        'createdAt',
      ]),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user))?.useVariant(
        'forCommentUser'
      ),
    }
  }
}
