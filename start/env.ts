/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string(),

  // Mail — SMTP (prod : relais hébergeur, O365, Google Workspace, SendGrid SMTP, etc.)
  MAIL_MAILER: Env.schema.enum(['smtp', 'log'] as const),
  MAIL_FROM_ADDRESS: Env.schema.string(),
  MAIL_FROM_NAME: Env.schema.string(),
  /** Vide en local avec Mailpit ; requis en prod si le relais exige une auth */
  SMTP_HOST: Env.schema.string.optional(),
  SMTP_PORT: Env.schema.number.optional(),
  SMTP_USERNAME: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.string.optional(),
  /** true ou port 465 : connexion TLS directe (souvent hébergeurs « SSL ») */
  SMTP_SECURE: Env.schema.boolean.optional(),

  // Database
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  DB_POOL_MIN: Env.schema.number.optional(),
  DB_POOL_MAX: Env.schema.number.optional(),
  DB_USE_SSL: Env.schema.boolean.optional(),
  DB_SSL_REJECT_UNAUTHORIZED: Env.schema.boolean.optional(),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),
  HEALTH_CHECK_SECRET: Env.schema.string.optional(),

  // Attachments storage
  ATTACHMENTS_DRIVER: Env.schema.string.optional(),
  ATTACHMENTS_LOCAL_TICKETS_DIR: Env.schema.string.optional(),
  ATTACHMENTS_LOCAL_PUBLIC_BASE_PATH: Env.schema.string.optional(),
  ATTACHMENTS_S3_ENDPOINT: Env.schema.string.optional(),
  ATTACHMENTS_S3_REGION: Env.schema.string.optional(),
  ATTACHMENTS_S3_BUCKET: Env.schema.string.optional(),
  ATTACHMENTS_S3_ACCESS_KEY_ID: Env.schema.string.optional(),
  ATTACHMENTS_S3_SECRET_ACCESS_KEY: Env.schema.string.optional(),
  ATTACHMENTS_S3_FORCE_PATH_STYLE: Env.schema.boolean.optional(),
  ATTACHMENTS_S3_KEY_PREFIX: Env.schema.string.optional(),
  ATTACHMENTS_S3_SIGNED_URL_TTL_SECONDS: Env.schema.number.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the limiter package
  |----------------------------------------------------------
  */
  LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),
})
