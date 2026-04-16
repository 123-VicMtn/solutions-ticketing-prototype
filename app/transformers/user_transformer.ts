import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'role',
      'status',
      'firstName',
      'lastName',
      'email',
      'phone',
      'notificationPreference',
      'createdAt',
      'updatedAt',
      'fullName',
      'initials',
    ])
  }

  forCommentUser() {
    return {
      id: this.resource.id,
      fullName: this.resource.fullName ?? null,
      email: this.resource.email ?? '-',
    }
  }

  forTicketUser() {
    return {
      id: this.resource.id,
      fullName: this.resource.fullName ?? null,
      email: this.resource.email ?? '-',
      phone: this.resource.phone ?? '-',
      role: this.resource.role,
      notificationPreference: this.resource.notificationPreference,
    }
  }

  forAssignee() {
    return {
      id: this.resource.id,
      fullName: this.resource.fullName ?? null,
    }
  }

  forUserUnitUser() {
    return {
      id: this.resource.id,
      fullName: this.resource.fullName ?? null,
      email: this.resource.email ?? '-',
      phone: this.resource.phone ?? '-',
      role: this.resource.role,
    }
  }
}
