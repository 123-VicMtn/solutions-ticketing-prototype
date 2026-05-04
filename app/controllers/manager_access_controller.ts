import OnboardingNotifications from '#services/onboarding_notifications'
import Unit from '#models/unit'
import User from '#models/user'
import UserUnit from '#models/user_unit'
import UnitTransformer from '#transformers/unit_transformer'
import UserTransformer from '#transformers/user_transformer'
import db from '@adonisjs/lucid/services/db'
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
      .whereNull('inviteToken')
      .orderBy('createdAt', 'desc')

    const units = await Unit.query().preload('building').orderBy('building_id').orderBy('label')

    return inertia.render('manager/access_requests', {
      requests: UserTransformer.transform(pendingRequests),
      units: UnitTransformer.transform(units),
    })
  }

  async approve({ request, response, params, session }: HttpContext) {
    const payload = await request.validateUsing(approveAccessRequestValidator)

    let approvedUser: User | null = null
    let approvedToken: string | null = null

    try {
      await db.transaction(async (trx) => {
        const user = await User.findOrFail(params.id, { client: trx })

        if (
          user.status !== 'pending' ||
          user.inviteToken !== null ||
          (user.role !== 'tenant' && user.role !== 'owner')
        ) {
          throw new Error('Cette demande ne peut pas être approuvée')
        }

        if (payload.relation !== user.role) {
          throw new Error('La relation doit correspondre au role demandé')
        }

        const token = randomUUID()
        const expiresAt = DateTime.now().plus({ days: 3 })

        // atomic writes: relation unit + invitation token
        await UserUnit.firstOrCreate(
          { userId: user.id, unitId: payload.unitId },
          { relation: payload.relation },
          { client: trx }
        )

        user.inviteToken = token
        user.inviteTokenExpiresAt = expiresAt
        await user.save()

        approvedUser = user
        approvedToken = token
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Cette demande ne peut pas être approuvée'
      return response.badRequest({ message })
    }

    // email should be sent after the transaction is committed to avoid inconsistencies
    if (!approvedUser || !approvedToken) {
      return response.badRequest({ message: 'Cette demande ne peut pas être approuvée' })
    }

    await OnboardingNotifications.sendAccessApproved(approvedUser, approvedToken)

    session.flash('success', 'Demande approuvée, invitation générée')
    return response.redirect().toPath('/manager/access-requests')
  }

  async reject({ request, response, params, session }: HttpContext) {
    const { reason } = await request.validateUsing(rejectAccessRequestValidator)

    let rejectedUser: User | null = null

    try {
      await db.transaction(async (trx) => {
        const user = await User.findOrFail(params.id, { client: trx })

        if (
          user.status !== 'pending' ||
          user.inviteToken !== null ||
          (user.role !== 'tenant' && user.role !== 'owner')
        ) {
          throw new Error('Cette demande ne peut pas être rejetée')
        }

        user.status = 'rejected'
        user.inviteToken = null
        user.inviteTokenExpiresAt = null
        await user.save()

        rejectedUser = user
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Cette demande ne peut pas être rejetée'
      return response.badRequest({ message })
    }

    if (!rejectedUser) {
      return response.badRequest({ message: 'Cette demande ne peut pas être rejetée' })
    }

    await OnboardingNotifications.sendAccessRejected(rejectedUser, reason)

    session.flash('success', 'Demande rejetée')
    return response.redirect().toPath('/manager/access-requests')
  }
}
