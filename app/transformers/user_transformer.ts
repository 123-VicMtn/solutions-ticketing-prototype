import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UserUnitTransformer from './user_unit_transformer.js'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'role',
        'status',
        'firstName',
        'lastName',
        'notificationPreference',
        'createdAt',
        'updatedAt',
        'fullName',
        'initials',
      ]),
      email: this.resource.email ?? '',
      phone: this.resource.phone ?? '',
      userUnits: UserUnitTransformer.transform(this.whenLoaded(this.resource.userUnits)),
    }
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
