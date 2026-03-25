import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/ticket'
import UserUnit from '#models/user_unit'

export default class DashboardController {
  /**
   * Display a list of resource
   */
  async index({ inertia, auth }: HttpContext) {
    const user = auth.user!

    let ownerUnitIds: number[] = []
    if (user.role === 'owner') {
      const userUnitRows = await UserUnit.query().where('userId', user.id).select('unitId')
      ownerUnitIds = userUnitRows.map((row) => row.unitId)
    }

    const applyScope = (query: ReturnType<typeof Ticket.query>) => {
      switch (user.role) {
        case 'admin':
        case 'manager':
          return query

        case 'provider':
          return query.where('assignedTo', user.id)

        case 'owner':
          return query.where((q) => {
            q.where('userId', user.id)
            if (ownerUnitIds.length > 0) q.orWhereIn('unitId', ownerUnitIds)
          })

        default:
          return query.where('userId', user.id)
      }
    }

    const countsRows = await applyScope(Ticket.query())
      .groupBy('status')
      .select('status')
      .count('id as count')

    const countsByStatus = (countsRows as any[]).map((row) => {
      const status = row.status ?? row.$extras?.status
      const rawCount = row.count ?? row.$extras?.count ?? row.$extras?.['count(id)']

      const count = rawCount === undefined || rawCount === null ? 0 : Number(rawCount)

      return {
        status: String(status),
        count,
      }
    })

    // Prototype: on masque volontairement le statut "fermé" dans le dashboard.
    const countsByStatusFiltered = countsByStatus.filter((row) => row.status !== 'fermé')

    const recentRows = await applyScope(
      Ticket.query()
        .preload('unit', (q) => q.preload('building'))
        .orderBy('id', 'desc')
        .limit(5)
    )

    const recentTickets = (recentRows as any[]).map((ticket) => ({
      id: ticket.id as number,
      reference: ticket.reference as string | null,
      title: ticket.title as string,
      status: ticket.status as string,
      createdAt: ticket.createdAt?.toISO?.() ?? '',
      unit: {
        label: ticket.unit?.label ?? '',
      },
    }))

    return inertia.render('dashboard', { countsByStatus: countsByStatusFiltered, recentTickets })
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({}: HttpContext) {}

  /**
   * Show individual record
   */
  async show({}: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({}: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({}: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({}: HttpContext) {}
}
