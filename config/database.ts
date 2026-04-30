import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

const databasePassword = env.get('DB_PASSWORD')

if (app.inProduction && !databasePassword) {
  throw new Error('DB_PASSWORD is required in production')
}

const databaseHost = env.get('DB_HOST')
const isLikelyExternalDatabase =
  app.inProduction &&
  databaseHost !== 'postgres' &&
  databaseHost !== 'localhost' &&
  databaseHost !== '127.0.0.1'
const useSsl = env.get('DB_USE_SSL') ?? isLikelyExternalDatabase

const dbConfig = defineConfig({
  connection: 'pg',

  connections: {
    pg: {
      client: 'pg',
      connection: {
        host: databaseHost,
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: databasePassword,
        database: env.get('DB_DATABASE'),
        ssl: useSsl
          ? {
              rejectUnauthorized: env.get('DB_SSL_REJECT_UNAUTHORIZED') ?? true,
            }
          : undefined,
      },
      pool: {
        min: env.get('DB_POOL_MIN') ?? 2,
        max: env.get('DB_POOL_MAX') ?? 10,
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: app.inDev,
    },
  },
})

export default dbConfig
