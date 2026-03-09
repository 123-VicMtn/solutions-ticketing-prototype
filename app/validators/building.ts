import vine from '@vinejs/vine'

export const createBuildingValidator = vine.create({
  name: vine.string().trim().maxLength(255),
  address: vine.string().trim().maxLength(255),
  city: vine.string().trim().maxLength(100),
  postalCode: vine.string().trim().maxLength(10),
})

export const updateBuildingValidator = vine.create({
  name: vine.string().trim().maxLength(255),
  address: vine.string().trim().maxLength(255),
  city: vine.string().trim().maxLength(100),
  postalCode: vine.string().trim().maxLength(10),
})
