import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password } = request.all()

    let user: User
    try {
      user = await User.verifyCredentials(email, password)
    } catch {
      session.flash('error', 'Identifiants invalides')
      return response.redirect().toRoute('session.create')
    }

    if (user.status !== 'active') {
      const messages: Record<string, string> = {
        pending:
          "Votre compte n'est pas encore activé (complétez l'invitation ou attendez la validation).",
        rejected: 'Votre demande d’accès a été refusée.',
        suspended: 'Votre compte est suspendu.',
      }
      session.flash('error', messages[user.status] ?? 'Connexion impossible pour le moment.')
      return response.redirect().toRoute('session.create')
    }

    await auth.use('web').login(user)
    response.redirect().toRoute('home')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
