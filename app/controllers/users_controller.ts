import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async create({ inertia }: HttpContext) {
    return inertia.render('users/create', {})
  }
  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const user = await User.create(payload)
    session.flash('success', 'Utilisateur créé avec succès')
    return response.redirect().toRoute('admin.users.show', { id: user.id })
  }

  async show({ inertia, params }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return inertia.render('users/show', { user })
  }

  async edit({ inertia, params }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return inertia.render('users/edit', { user })
  }

  async update({ request, response, params, session }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const payload = await request.validateUsing(updateUserValidator)
    user.merge(payload)
    await user.save()
    session.flash('success', 'Utilisateur modifié avec succès')
    return response.redirect().toRoute('admin.users.show', { id: user.id })
  }
}
