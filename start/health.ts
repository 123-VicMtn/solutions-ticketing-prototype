import {
  HealthChecks,
  DiskSpaceCheck,
  MemoryHeapCheck,
  MemoryRSSCheck,
} from '@adonisjs/core/health'
import { DbCheck, DbConnectionCountCheck } from '@adonisjs/lucid/database'
import db from '@adonisjs/lucid/services/db'
import { TicketingSystemCheck } from '#health_checks/ticketing_system_check'
import { PropertyAccessCheck } from '#health_checks/property_access_check'

export const healthChecks = new HealthChecks().register([
  /**
   * Check PostgreSQL database
   * Critical for the ticketing application
   */
  new DbCheck(db.connection()),

  /**
   * Checks number of database connections
   * Warn if > 8 connections, fail if > 12
   */
  new DbConnectionCountCheck(db.connection()).warnWhenExceeds(8).failWhenExceeds(12),

  /**
   * Check disk space
   * Cache for 1 hour because disk space changes slowly
   */
  new DiskSpaceCheck().warnWhenExceeds(75).failWhenExceeds(85).cacheFor('1 hour'),

  /**
   * Check memory heap
   * Important to detect memory leaks
   */
  new MemoryHeapCheck().warnWhenExceeds('300 mb').failWhenExceeds('500 mb'),

  /**
   * Check memory RSS (Resident Set Size)
   * Total memory allocated to the process
   */
  new MemoryRSSCheck().warnWhenExceeds('400 mb').failWhenExceeds('600 mb'),

  /**
   * Custom check for the ticketing system
   */
  new TicketingSystemCheck().cacheFor('5 minutes'),

  /**
   * Custom check for property access
   */
  new PropertyAccessCheck().cacheFor('5 minutes'),
])
