import type Unit from '#models/unit'
import { BaseTransformer } from '@adonisjs/core/transformers'
import BuildingTransformer from './building_transformer.js'
import UserUnitTransformer from './user_unit_transformer.js'

export default class UnitTransformer extends BaseTransformer<Unit> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'buildingId', 'label', 'floor', 'type']),
      building: BuildingTransformer.transform(this.whenLoaded(this.resource.building)),
      userUnits: UserUnitTransformer.transform(
        this.whenLoaded(this.resource.userUnits)
      )?.useVariant('forUnitListing'),
    }
  }
}
