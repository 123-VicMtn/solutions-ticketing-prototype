import type Provider from '#models/provider'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ProviderTransformer extends BaseTransformer<Provider> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'companyName', 'speciality']),
      phone: this.resource.phone ?? '',
    }
  }
}
