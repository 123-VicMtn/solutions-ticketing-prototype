export type TicketStatus = 'ouvert' | 'assigné' | 'en cours' | 'terminé' | 'résolu' | 'fermé'

export const TICKET_STATUS_ORDER: TicketStatus[] = [
  'ouvert',
  'assigné',
  'en cours',
  'terminé',
  'résolu',
  'fermé',
]

export function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === 'string' && (TICKET_STATUS_ORDER as readonly string[]).includes(value)
}

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase()
}

export function ticketStatusBadgeClass(status: string): string {
  const s = normalizeStatus(status)
  switch (s) {
    case 'ouvert':
      return 'badge badge-info'
    case 'assigné':
      return 'badge badge-accent'
    case 'en cours':
      return 'badge badge-warning'
    case 'terminé':
      return 'badge badge-success badge-outline'
    case 'résolu':
      return 'badge badge-success'
    case 'fermé':
      return 'badge badge-error'
    default:
      return 'badge badge-neutral'
  }
}

