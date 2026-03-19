import Provider from '#models/provider'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RequireProviderMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({
        message: 'Veuillez vous connecter pour accéder à cette page',
      })
    }

    if (user.role !== 'provider') {
      return ctx.response.forbidden({
        message: 'Accès réservé aux prestataires',
      })
    }

    if (user.status !== 'active') {
      return ctx.response.forbidden({
        message: 'Compte prestataire inactif',
      })
    }

    const provider = await Provider.query().where('userId', user.id).first()
    if (!provider || !provider.isActive) {
      return ctx.response.forbidden({
        message: 'Profil prestataire inactif ou introuvable',
      })
    }

    return next()
  }
}
