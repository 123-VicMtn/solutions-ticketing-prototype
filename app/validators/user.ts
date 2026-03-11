import vine from '@vinejs/vine'

const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

export const createUserValidator = vine.create({
  firstName: vine.string().trim().maxLength(100),
  lastName: vine.string().trim().maxLength(100),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password().confirmed({
    confirmationField: 'passwordConfirmation',
  }),
})

export const updateUserValidator = vine.create({
  firstName: vine.string().trim().maxLength(100),
  lastName: vine.string().trim().maxLength(100),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password().confirmed({
    confirmationField: 'passwordConfirmation',
  }),
})
