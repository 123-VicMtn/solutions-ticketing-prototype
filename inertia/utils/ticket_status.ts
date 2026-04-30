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
