export type TicketPriority = 'basse' | 'moyenne' | 'élevée' | 'urgente'

export const TICKET_PRIORITY_ORDER: TicketPriority[] = ['basse', 'moyenne', 'élevée', 'urgente']

export function isTicketPriority(value: unknown): value is TicketPriority {
  return typeof value === 'string' && (TICKET_PRIORITY_ORDER as readonly string[]).includes(value)
}

function normalizePriority(priority: string): string {
  return priority.trim().toLowerCase()
}

export function ticketPriorityBadgeClass(priority: string): string {
  const p = normalizePriority(priority)
  switch (p) {
    case 'basse':
      return 'badge badge-soft badge-outline badge-success'
    case 'moyenne':
      return 'badge badge-soft badge-outline badge-warning'
    case 'élevée':
      return 'badge badge-soft badge-outline border-[color:var(--color-attention)] text-[color:var(--color-attention)]'
    case 'urgente':
      return 'badge badge-soft badge-outline badge-error'
    default:
      return 'badge badge-soft badge-outline badge-neutral'
  }
}
