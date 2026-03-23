import OnboardingNotifications from '#services/onboarding_notifications'
import Unit from '#models/unit'
import User from '#models/user'
import UserUnit from '#models/user_unit'
import {
  approveAccessRequestValidator,
  rejectAccessRequestValidator,
} from '#validators/access_request'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class ManagerAccessController {
  async index({ inertia }: HttpContext) {
    const pendingRequests = await User.query()
      .whereIn('role', ['tenant', 'owner'])
      .where('status', 'pending')
      .whereNull('invite_token')
      .orderBy('created_at', 'desc')

    const units = await Unit.query().preload('building').orderBy('building_id').orderBy('label')

    return inertia.render('manager/access_requests', {
      requests: pendingRequests.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role as 'tenant' | 'owner',
        createdAt: user.createdAt.toISO() ?? '',
      })),
      units: units.map((unit) => ({
        id: unit.id,
        label: unit.label,
        building: {
          id: unit.building.id,
          name: unit.building.name,
        },
      })),
    })
  }

  async approve({ request, response, params, session }: HttpContext) {
    const payload = await request.validateUsing(approveAccessRequestValidator)
    const user = await User.findOrFail(params.id)

    if (
      user.status !== 'pending' ||
      user.inviteToken !== null ||
      (user.role !== 'tenant' && user.role !== 'owner')
    ) {
      return response.badRequest({ message: 'Cette demande ne peut pas être approuvée' })
    }

    if (payload.relation !== user.role) {
      return response.badRequest({ message: 'La relation doit correspondre au role demandé' })
    }

    const token = randomUUID()
    const expiresAt = DateTime.now().plus({ days: 3 })

    await UserUnit.firstOrCreate(
      { userId: user.id, unitId: payload.unitId },
      { relation: payload.relation }
    )

    user.inviteToken = token
    user.inviteTokenExpiresAt = expiresAt
    await user.save()

    await OnboardingNotifications.sendAccessApproved(user, token)

    session.flash('success', 'Demande approuvée, invitation générée')
    return response.redirect().toPath('/manager/access-requests')
  }

  async reject({ request, response, params, session }: HttpContext) {
    const { reason } = await request.validateUsing(rejectAccessRequestValidator)
    const user = await User.findOrFail(params.id)

    if (
      user.status !== 'pending' ||
      user.inviteToken !== null ||
      (user.role !== 'tenant' && user.role !== 'owner')
    ) {
      return response.badRequest({ message: 'Cette demande ne peut pas être rejetée' })
    }

    user.status = 'rejected'
    user.inviteToken = null
    user.inviteTokenExpiresAt = null
    await user.save()

    await OnboardingNotifications.sendAccessRejected(user, reason)

    session.flash('success', 'Demande rejetée')
    return response.redirect().toPath('/manager/access-requests')
  }
}
