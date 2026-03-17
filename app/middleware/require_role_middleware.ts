import type { UserRole } from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RequireRoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, allowedRoles: UserRole[]) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({
        message: 'Veuillez vous connecter pour accéder à cette page',
      })
    }

    if (!allowedRoles.includes(user.role)) {
      return ctx.response.forbidden({
        message: "Vous n'avez pas les permissions nécessaires pour accéder à cette page",
      })
    }

    return next()
  }
}
