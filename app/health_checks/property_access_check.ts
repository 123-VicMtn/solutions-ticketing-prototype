import { Result, BaseCheck } from '@adonisjs/core/health'
import type { HealthCheckResult } from '@adonisjs/core/types/health'
import db from '@adonisjs/lucid/services/db'

/**
 * Check if the units (lots) are accessible
 * and that the critical relationships work
 */
export class PropertyAccessCheck extends BaseCheck {
  name = 'Unit access check'

  async run(): Promise<HealthCheckResult> {
    try {
      const startTime = Date.now()
      const warnQueryTimeMs = 750

      const unitsCount = await db
        .from('units')
        .count('* as total')

      const totalUnits = Number(unitsCount[0].total)

      if (totalUnits === 0) {
        return Result.warning('No units found in the system (monitoring)').mergeMetaData({
          totalUnits: 0,
        })
      }

      const unitsWithTickets = await db
        .from('units')
        .join('tickets', 'units.id', 'tickets.unit_id')
        .whereIn('tickets.status', ['ouvert', 'assigné', 'en cours'])
        .distinct('units.id')
        .count('* as total')

      const activeUnits = Number(unitsWithTickets[0].total)

      const queryTime = Date.now() - startTime
      if (queryTime > warnQueryTimeMs) {
        return Result.warning('Database is slow for units↔tickets query (monitoring)').mergeMetaData({
          queryTimeMs: queryTime,
          warnQueryTimeMs,
          totalUnits,
          unitsWithActiveTickets: activeUnits,
        })
      }

      return Result.ok('Units access is operational').mergeMetaData({
        totalUnits,
        unitsWithActiveTickets: activeUnits,
        queryTimeMs: queryTime,
        warnQueryTimeMs,
      })

    } catch (error) {
      return Result.warning('Unable to compute units↔tickets metrics (monitoring)').mergeMetaData({
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
}