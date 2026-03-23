import { configProvider } from '@adonisjs/core'
import { defineConfig, transports } from '@adonisjs/mail'
import env from '#start/env'

const smtpPort = env.get('SMTP_PORT') ?? 1025
const smtpSecure = env.get('SMTP_SECURE') === true || smtpPort === 465
const smtpRequireTls = !smtpSecure && smtpPort === 587

const mailConfig = defineConfig({
  default: env.get('MAIL_MAILER'),

  from: {
    address: env.get('MAIL_FROM_ADDRESS'),
    name: env.get('MAIL_FROM_NAME'),
  },

  globals: {
    brandName: '123 Ticketing',
    appUrl: env.get('APP_URL'),
  },

  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST') ?? '127.0.0.1',
      requireTLS: smtpRequireTls,
      port: smtpPort,
      secure: smtpSecure,
      ...(smtpRequireTls ? { requireTLS: true } : {}),
      ...(env.get('SMTP_USERNAME')
        ? {
            auth: {
              type: 'login' as const,
              user: env.get('SMTP_USERNAME') as string,
              pass: env.get('SMTP_PASSWORD') ?? '',
            },
          }
        : {}),
    }),
    log: configProvider.create(async () => {
      const { JSONTransport } = await import('@adonisjs/mail/transports/json')
      return () => new JSONTransport()
    }),
  },
})

export default mailConfig
