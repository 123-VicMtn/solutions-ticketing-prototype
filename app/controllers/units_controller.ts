import Unit from '#models/unit'
import Building from '#models/building'
import { createUnitValidator, updateUnitValidator } from '#validators/unit'
import type { HttpContext } from '@adonisjs/core/http'

export default class UnitsController {
  async index({ inertia, request }: HttpContext) {
    const buildingId = request.input('building_id')

    const query = Unit.query().preload('building').orderBy('building_id').orderBy('label')

    if (buildingId) {
      query.where('buildingId', buildingId)
    }

    const units = await query
    const buildings = await Building.query().orderBy('name')

    return inertia.render('admin/units/index', { units, buildings, filters: { buildingId } })
  }

  async create({ inertia }: HttpContext) {
    const buildings = await Building.query().orderBy('name')
    return inertia.render('admin/units/create', { buildings })
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(createUnitValidator)
    await Unit.create(payload)
    session.flash('success', 'Lot créé avec succès')
    return response.redirect().toRoute('admin.units.index')
  }

  async edit({ inertia, params }: HttpContext) {
    const unit = await Unit.findOrFail(params.id)
    await unit.load('building')
    const buildings = await Building.query().orderBy('name')
    return inertia.render('admin/units/edit', { unit, buildings })
  }

  async update({ request, response, params, session }: HttpContext) {
    const unit = await Unit.findOrFail(params.id)
    const payload = await request.validateUsing(updateUnitValidator)
    unit.merge(payload)
    await unit.save()
    session.flash('success', 'Lot modifié avec succès')
    return response.redirect().toRoute('admin.units.index')
  }

  async destroy({ response, params, session }: HttpContext) {
    const unit = await Unit.findOrFail(params.id)
    await unit.delete()
    session.flash('success', 'Lot supprimé')
    return response.redirect().toRoute('admin.units.index')
  }
}
