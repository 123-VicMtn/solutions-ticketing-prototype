import vine from '@vinejs/vine'

export const createTicketValidator = vine.create({
  unitId: vine.number().positive(),
  category: vine.enum(['plumbing', 'electricity', 'heating', 'general', 'other']),
  priority: vine.enum(['low', 'medium', 'high', 'urgent']),
  title: vine.string().trim().minLength(5).maxLength(180),
  description: vine.string().trim().minLength(10).maxLength(10000),
})

export const statusTicketValidator = vine.create({
  status: vine.enum(['open', 'assigned', 'in_progress', 'resolved', 'closed']),
})

export const commentTicketValidator = vine.create({
  content: vine.string().trim().minLength(1).maxLength(4000),
  isInternal: vine.boolean().optional(),
})
