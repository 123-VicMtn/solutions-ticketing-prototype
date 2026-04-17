import User from '#models/user'
import TicketTransformer from '#transformers/ticket_transformer'
import UserTransformer from '#transformers/user_transformer'
import UserUnitTransformer from '#transformers/user_unit_transformer'
import { createUserValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ inertia }: HttpContext) {
    const users = await User.query()
      .preload('userUnits', (q) => q.preload('unit', (r) => r.preload('building')))
      .preload('tickets')

    return inertia.render('users/index', {
      users: UserTransformer.transform(users),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('users/create', {})
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const user = await User.create(payload)
    session.flash('success', 'Utilisateur créé avec succès')
    return response.redirect().toRoute('users.show', { id: user.id })
  }

  async show({ inertia, params }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .preload('userUnits', (q) => q.preload('unit', (r) => r.preload('building')))
      .preload('tickets', (q) =>
        q
          .preload('unit', (r) => r.preload('building'))
          .preload('comments', (r) => r.preload('user'))
          .preload('attachments')
      )
      .firstOrFail()

    return inertia.render('users/show', {
      profileUser: UserTransformer.transform(user),
      userUnits: UserUnitTransformer.transform(user.userUnits),
      tickets: TicketTransformer.transform(user.tickets),
    })
  }

  async edit({ inertia, params }: HttpContext) {
    const user = await User.findOrFail(params.id)

    return inertia.render('users/edit', {
      user: UserTransformer.transform(user),
    })
  }

  async update({ request, response, params, session }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const payload = await request.validateUsing(updateUserValidator)
    user.merge(payload)
    await user.save()
    session.flash('success', 'Utilisateur modifié avec succès')
    return response.redirect().toRoute('users.show', { id: user.id })
  }
}
