import type { UserRole } from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RequireRoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, allowedRoles: UserRole[]) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({ messsage: 'Not authenticated' })
    }

    if (!allowedRoles.includes(user.role)) {
      return ctx.response.unauthorized({ messsage: 'Insufficient permissions' })
    }

    return next()
  }
}
