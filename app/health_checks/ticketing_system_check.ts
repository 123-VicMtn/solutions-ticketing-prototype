import { Result, BaseCheck } from '@adonisjs/core/health'
import type { HealthCheckResult } from '@adonisjs/core/types/health'
import db from '@adonisjs/lucid/services/db'

/**
 * Vérifie l'état du système de ticketing 
 * - Présence des tables critiques
 * - Nombre de tickets ouverts + non assignés
 * - Performance des requêtes
 */
export class TicketingSystemCheck extends BaseCheck {
  name = 'Ticketing system check'

  async run(): Promise<HealthCheckResult> {
    try {
      const startTime = Date.now()
      const warnQueryTimeMs = 750
      const criticalTables = [
        'users',
        'buildings',
        'units',
        'user_units',
        'tickets',
        'ticket_comments',
        'ticket_attachments',
        'providers',
      ] as const

      // Check if the critical tables exist
      const tablesResult = await db.rawQuery(`
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
          'users', 'buildings', 'units', 'user_units', 'tickets', 'ticket_comments', 'ticket_attachments', 'providers'
        )
      `)

      const foundTablesList = tablesResult.rows.map((r: { table_name: string }) => r.table_name)
      const missingTables = criticalTables.filter((t) => !foundTablesList.includes(t))

      if (missingTables.length > 0) {
        return Result.warning('Schema incomplete: expected tables are missing').mergeMetaData({
          missingTables,
          foundTables: foundTablesList.sort(),
        })
      }

      // Check if we can execute critical queries quickly
      const now = () => Date.now()
      const readQueryStartedAt = now()

      const openTicketsResult = await db.from('tickets').where('status', 'ouvert').count('* as total')
      const unassignedOpenTicketsResult = await db
        .from('tickets')
        .where('status', 'ouvert')
        .whereNull('assigned_to')
        .count('* as total')

      const openTickets = Number(openTicketsResult[0].total)
      const unassignedOpenTickets = Number(unassignedOpenTicketsResult[0].total)

      const queryTime = Date.now() - startTime
      const readQueryTimeMs = now() - readQueryStartedAt

      if (readQueryTimeMs > warnQueryTimeMs) {
        return Result.warning('Database is slow for ticketing queries (monitoring)').mergeMetaData({
          readQueryTimeMs,
          warnQueryTimeMs,
          openTickets,
          unassignedOpenTickets,
        })
      }

      // Warnings if there are too many open tickets to notify the team
      if (openTickets > 500) {
        return Result.warning('High number of open tickets (monitoring)').mergeMetaData({
          openTickets,
          unassignedOpenTickets,
          queryTimeMs: queryTime,
          threshold: 500,
        })
      }

      if (unassignedOpenTickets > 100) {
        return Result.warning('High number of unassigned open tickets (monitoring)').mergeMetaData({
          openTickets,
          unassignedOpenTickets,
          queryTimeMs: queryTime,
          threshold: 100,
        })
      }

      return Result.ok('Ticketing system is operational').mergeMetaData({
        openTickets,
        unassignedOpenTickets,
        queryTimeMs: queryTime,
        readQueryTimeMs,
        warnQueryTimeMs,
      })

    } catch (error) {
      return Result.warning('Unable to compute ticketing metrics (monitoring)').mergeMetaData({
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
}