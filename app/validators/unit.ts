import vine from '@vinejs/vine'

export const createUnitValidator = vine.create({
  buildingId: vine.number().positive(),
  label: vine.string().trim().maxLength(50),
  floor: vine.number(),
  type: vine.enum(['apartment', 'commercial', 'parking', 'storage']),
})

export const updateUnitValidator = vine.create({
  label: vine.string().trim().maxLength(50),
  floor: vine.number(),
  type: vine.enum(['apartment', 'commercial', 'parking', 'storage']),
})
