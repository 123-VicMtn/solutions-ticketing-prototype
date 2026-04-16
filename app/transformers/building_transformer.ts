import type Building from '#models/building'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class BuildingTransformer extends BaseTransformer<Building> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'address', 'city', 'postalCode'])
  }

  /**
   * Version légère pour les listes / sous-objets (ex: building lié à un unit).
   */
  forSummary() {
    return this.pick(this.resource, ['id', 'name'])
  }
}

