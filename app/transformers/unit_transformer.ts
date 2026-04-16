import type Unit from '#models/unit'
import { BaseTransformer } from '@adonisjs/core/transformers'
import BuildingTransformer from './building_transformer.js'

export default class UnitTransformer extends BaseTransformer<Unit> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'buildingId', 'label', 'floor', 'type']),
      building: BuildingTransformer.transform(this.whenLoaded(this.resource.building))?.useVariant(
        'forSummary'
      ),
    }
  }
}
