import User from '#models/user'
import { requestAccessValidator, setPasswordValidator } from '#validators/access_request'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class AccessRequestsController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/request_access', {})
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(requestAccessValidator)

    await User.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone ?? null,
      role: payload.role,
      status: 'pending',
      notificationPreference: payload.notificationPreference,
      // Temporary random password until invite is approved.
      password: randomUUID(),
      inviteToken: null,
      inviteTokenExpiresAt: null,
    })

    session.flash(
      'success',
      "Votre demande d'accès a été envoyée. Vous recevrez un email après validation."
    )
    return response.redirect().toRoute('session.create')
  }

  async setPasswordPage({ inertia, params, response, session }: HttpContext) {
    const user = await User.query()
      .where('inviteToken', params.token)
      .where('inviteTokenExpiresAt', '>', DateTime.now().toSQL())
      .first()

    if (!user) {
      session.flash('error', 'Lien invalide ou expiré')
      return response.redirect().toRoute('session.create')
    }

    return inertia.render('auth/set_password', { token: params.token })
  }

  async setPassword({ request, auth, params, response, session }: HttpContext) {
    const payload = await request.validateUsing(setPasswordValidator)

    const user = await User.query()
      .where('inviteToken', params.token)
      .where('inviteTokenExpiresAt', '>', DateTime.now().toSQL())
      .first()

    if (!user) {
      session.flash('error', 'Lien invalide ou expiré')
      return response.redirect().toRoute('session.create')
    }

    user.password = payload.password
    user.status = 'active'
    user.inviteToken = null
    user.inviteTokenExpiresAt = null
    await user.save()

    await auth.use('web').login(user)
    return response.redirect().toRoute('home')
  }
}
