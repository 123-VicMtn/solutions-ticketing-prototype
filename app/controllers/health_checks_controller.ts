import { healthChecks } from '#start/health'
import type { HttpContext } from '@adonisjs/core/http'

export default class HealthChecksController {
  /**
   * Liveness probe: Check if the process is running.
   * Does not check external dependencies.
   * Will be used by Docker/Kubernetes to decide if the container should be restarted.
   */
  async live({ response }: HttpContext) {
    return response.ok({
      status: 'alive',
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Readiness probe: Run all registered health checks
   * and return a detailed report.
   * Will be used by Docker/Kubernetes to decide if the container can receive traffic.
   */
  async ready({ response }: HttpContext) {
    const report = await healthChecks.run()
    
    if (report.isHealthy) {
      return response.ok(report)
    }

    return response.serviceUnavailable(report)
  }
}