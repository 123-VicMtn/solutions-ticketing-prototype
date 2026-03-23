import logger from '@adonisjs/core/services/logger'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import User from '#models/user'

export default class OnboardingNotifications {
  /**
   * Notify all active managers that a new access request was submitted.
   */
  static async notifyManagersNewAccessRequest(applicant: User) {
    const managers = await User.query().where('role', 'manager').where('status', 'active')
    const recipients = managers.map((m) => m.email).filter((e): e is string => Boolean(e))

    if (recipients.length === 0) {
      logger.warn('Aucun manager actif avec email pour notifier une demande d’accès')
      return
    }

    const managerUrl = `${env.get('APP_URL')}/manager/access-requests`

    for (const address of recipients) {
      try {
        await mail.send((message) => {
          message
            .to(address)
            .subject(`Nouvelle demande d’accès — ${applicant.fullName ?? applicant.email}`)
            .htmlView('emails/access_request_submitted', {
              applicantName: applicant.fullName ?? `${applicant.firstName} ${applicant.lastName}`,
              applicantEmail: applicant.email,
              applicantRole: applicant.role,
              managerUrl,
            })
        })
      } catch (error) {
        logger.error({ err: error }, `Échec envoi email demande d’accès à ${address}`)
      }
    }
  }

  /**
   * Send invite link to set password after manager approval.
   */
  static async sendAccessApproved(user: User, inviteToken: string) {
    if (!user.email) {
      logger.warn({ userId: user.id }, 'Utilisateur sans email : impossible d’envoyer l’invitation')
      return
    }

    const setPasswordUrl = `${env.get('APP_URL')}/set-password/${inviteToken}`

    try {
      await mail.send((message) => {
        message
          .to(user.email!)
          .subject('Votre accès a été approuvé')
          .htmlView('emails/access_request_approved', {
            userName: user.fullName ?? user.firstName,
            setPasswordUrl,
          })
      })
    } catch (error) {
      logger.error({ err: error }, 'Échec envoi email d’approbation d’accès')
    }
  }

  /**
   * Inform applicant that the request was rejected.
   */
  static async sendAccessRejected(user: User, reason?: string) {
    if (!user.email) return

    try {
      await mail.send((message) => {
        message
          .to(user.email!)
          .subject('Votre demande d’accès')
          .htmlView('emails/access_request_rejected', {
            userName: user.fullName ?? user.firstName,
            reason: reason ?? null,
          })
      })
    } catch (error) {
      logger.error({ err: error }, 'Échec envoi email de rejet d’accès')
    }
  }
}
