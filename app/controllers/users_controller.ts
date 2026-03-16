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
    return response
      .redirect()
      .toRoute(user.role === 'admin' ? 'admin.users.show' : 'home', { id: user.id })
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
      profileUser: {
        id: user.id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email ?? '-',
        phone: user.phone ?? '-',
        notificationPreference: user.notificationPreference,
        createdAt: user.createdAt.toISO() ?? '',
        updatedAt: user.updatedAt?.toISO() ?? '',
      },
      userUnits: user.userUnits.map((userUnit) => ({
        id: userUnit.id,
        relation: userUnit.relation,
        unit: {
          id: userUnit.unit.id,
          label: userUnit.unit.label,
          building: { id: userUnit.unit.building.id, name: userUnit.unit.building.name },
        },
      })),
      tickets: user.tickets.map((ticket) => ({
        id: ticket.id,
        reference: ticket.reference,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        title: ticket.title,
        description: ticket.description,
        createdAt: ticket.createdAt.toISO() ?? '',
      })),
    })
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
