import type Building from '#models/building'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class BuildingTransformer extends BaseTransformer<Building> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'address', 'city', 'postalCode'])
  }

  forSummary() {
    return this.pick(this.resource, ['id', 'name'])
  }

  forListing() {
    return {
      ...this.toObject(),
      unitsCount: Number(this.resource.$extras?.units_count ?? 0),
    }
  }
}
