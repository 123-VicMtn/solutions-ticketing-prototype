import Building from '#models/building'
import { createBuildingValidator, updateBuildingValidator } from '#validators/building'
import type { HttpContext } from '@adonisjs/core/http'

export default class BuildingsController {
  async index({ inertia }: HttpContext) {
    const buildings = await Building.query().withCount('units').orderBy('name')
    return inertia.render('admin/buildings/index', {
      buildings: buildings.map((b) => ({
        ...b.serialize(),
        unitsCount: Number(b.$extras.units_count),
      })),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/buildings/create')
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(createBuildingValidator)
    await Building.create(payload)
    session.flash('success', 'Immeuble créé avec succès')
    return response.redirect().toRoute('admin.buildings.index')
  }

  async edit({ inertia, params }: HttpContext) {
    const building = await Building.findOrFail(params.id)
    return inertia.render('admin/buildings/edit', { building })
  }

  async update({ request, response, params, session }: HttpContext) {
    const building = await Building.findOrFail(params.id)
    const payload = await request.validateUsing(updateBuildingValidator)
    building.merge(payload)
    await building.save()
    session.flash('success', 'Immeuble modifié avec succès')
    return response.redirect().toRoute('admin.buildings.index')
  }

  async destroy({ response, params, session }: HttpContext) {
    const building = await Building.findOrFail(params.id)
    await building.delete()
    session.flash('success', 'Immeuble supprimé')
    return response.redirect().toRoute('admin.buildings.index')
  }
}
