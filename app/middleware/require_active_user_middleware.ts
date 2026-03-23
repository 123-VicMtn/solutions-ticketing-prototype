import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RequireActiveUserMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({
        message: 'Veuillez vous connecter pour accéder à cette page',
      })
    }

    if (user.status === 'pending') {
      return ctx.response.forbidden({
        message: "Votre compte est en attente d'approbation",
      })
    }

    if (user.status === 'suspended') {
      return ctx.response.forbidden({
        message: 'Votre compte a été suspendu',
      })
    }

    if (user.status === 'rejected') {
      return ctx.response.forbidden({
        message: "Votre demande d'accès a été rejetée",
      })
    }

    return next()
  }
}
