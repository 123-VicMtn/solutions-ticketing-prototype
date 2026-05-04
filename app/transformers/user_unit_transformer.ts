import type UserUnit from '#models/user_unit'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UnitTransformer from './unit_transformer.js'
import UserTransformer from './user_transformer.js'

export default class UserUnitTransformer extends BaseTransformer<UserUnit> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'userId', 'unitId', 'relation']),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user))?.useVariant(
        'forUserUnitUser'
      ),
      unit: UnitTransformer.transform(this.whenLoaded(this.resource.unit))?.depth(2),
    }
  }

  forUnitListing() {
    return {
      id: this.resource.id,
      relation: this.resource.relation,
      user: UserTransformer.transform(this.whenLoaded(this.resource.user))?.useVariant(
        'forUserUnitUser'
      ),
    }
  }
}
