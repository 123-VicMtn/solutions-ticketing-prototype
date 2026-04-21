import vine from '@vinejs/vine'

export const createTicketValidator = vine.create({
  unitId: vine.number().positive(),
  category: vine.enum([
    'Technique & Maintenance',
    'Entretien & Nettoyage',
    'Administratifs & Contrats',
    'Finance & Facturation',
    'Relations & Conflits',
    'Gestion des accès',
    'Déménagement',
    'Urgences',
  ]),
  priority: vine.enum(['basse', 'moyenne', 'élevée', 'urgente']).optional(),
  title: vine.string().trim().minLength(5).maxLength(180),
  description: vine.string().trim().minLength(10).maxLength(10000),
})

export const updateTicketValidator = vine.create({
  title: vine.string().trim().minLength(5).maxLength(180).optional(),
  description: vine.string().trim().minLength(10).maxLength(10000).optional(),
  priority: vine.enum(['basse', 'moyenne', 'élevée', 'urgente']).optional(),
})

export const statusTicketValidator = vine.create({
  status: vine.enum(['ouvert', 'assigné', 'en cours', 'terminé', 'résolu', 'fermé']),
})

export const commentTicketValidator = vine.create({
  content: vine.string().trim().minLength(1).maxLength(4000),
  isInternal: vine.boolean().optional(),
})

export const assignTicketValidator = vine.create({
  assigneeUserId: vine.number().positive().exists({ table: 'users', column: 'id' }),
  providerId: vine.number().positive().exists({ table: 'providers', column: 'id' }).optional(),
})
