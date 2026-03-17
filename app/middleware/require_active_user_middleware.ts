import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RequireActiveUserMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({ message: 'Not authenticated' })
    }

    if (user.status !== 'active') {
      return ctx.response.forbidden({ message: 'User is not active' })
    }

    return next()
  }
}
