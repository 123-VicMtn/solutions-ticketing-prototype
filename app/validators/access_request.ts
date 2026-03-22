import vine from '@vinejs/vine'

const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

export const requestAccessValidator = vine.create({
  firstName: vine.string().trim().maxLength(100),
  lastName: vine.string().trim().maxLength(100),
  email: email().unique({ table: 'users', column: 'email' }),
  phone: vine.string().trim().maxLength(30).optional(),
  role: vine.enum(['tenant', 'owner'] as const),
  notificationPreference: vine.enum(['email', 'sms'] as const),
})

export const approveAccessRequestValidator = vine.create({
  unitId: vine.number().positive().exists({ table: 'units', column: 'id' }),
  relation: vine.enum(['tenant', 'owner'] as const),
})

export const rejectAccessRequestValidator = vine.create({
  reason: vine.string().trim().maxLength(500).optional(),
})

export const setPasswordValidator = vine.create({
  password: password().confirmed({
    confirmationField: 'passwordConfirmation',
  }),
})
