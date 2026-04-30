import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import RequireRoleMiddleware from '#middleware/require_role_middleware'
import User, { type UserRole, type UserStatus } from '#models/user'
import { strict as assert } from 'node:assert'

const DEFAULT_PASSWORD = 'Password123!'

async function createUser(role: UserRole, status: UserStatus = 'active') {
  return User.create({
    role,
    status,
    firstName: role,
    lastName: 'user',
    email: `${role}.${status}.${Date.now()}.${Math.random()}@example.test`,
    phone: null,
    notificationPreference: 'email',
    password: DEFAULT_PASSWORD,
    inviteToken: null,
    inviteTokenExpiresAt: null,
  })
}

async function loginWithWebForm(client: any, email: string, password: string) {
  return client.post('/login').form({ email, password })
}

test.group('Role authorization matrix', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('guest is redirected when accessing access-requests page', async ({ client }: any) => {
    // Arrange

    // Act
    const response = await client.get('/manager/access-requests')

    // Assert
    response.assertRedirectsTo('/login')
  })

  test('requireRole manager enforces tenant/owner/provider/manager/admin matrix', async () => {
    // Arrange
    const middleware = new RequireRoleMiddleware()
    const roles: UserRole[] = ['tenant', 'owner', 'provider', 'manager', 'admin']
    const expectedStatus: Record<UserRole, 200 | 403> = {
      tenant: 403,
      owner: 403,
      provider: 403,
      manager: 200,
      admin: 200,
    }

    // Act + Assert
    for (const role of roles) {
      const user = await createUser(role)
      let statusCode: number | null = null

      const result = await middleware.handle(
        {
          auth: { user },
          response: {
            unauthorized: () => {
              statusCode = 401
              return statusCode
            },
            forbidden: () => {
              statusCode = 403
              return statusCode
            },
          },
        } as any,
        async () => {
          statusCode = 200
        },
        'manager'
      )

      assert.equal((result ?? statusCode) as number, expectedStatus[role])
    }
  })
})

test.group('Onboarding flow', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('request-access creates pending user and set-password activates account', async ({ client }: any) => {
    // Arrange
    const email = `onboarding.${Date.now()}.${Math.random()}@example.test`

    // Act
    const requestAccessResponse = await client.post('/request-access').form({
      firstName: 'Onboard',
      lastName: 'User',
      email,
      phone: '+41000000000',
      role: 'tenant',
      notificationPreference: 'email',
    })

    // Assert
    requestAccessResponse.assertRedirectsTo('/login')

    const applicant = await User.findByOrFail('email', email)
    assert.equal(applicant.status, 'pending')

    // Act
    const blockedLoginResponse = await loginWithWebForm(client, email, DEFAULT_PASSWORD)

    // Assert
    blockedLoginResponse.assertRedirectsTo('/login')

    // Arrange
    applicant.inviteToken = `invite-${Date.now()}`
    applicant.inviteTokenExpiresAt = DateTime.now().plus({ days: 1 })
    await applicant.save()

    // Act
    const setPasswordResponse = await client
      .post(`/set-password/${applicant.inviteToken}`)
      .form({
        password: 'NewPassword123!',
        passwordConfirmation: 'NewPassword123!',
      })

    // Assert
    setPasswordResponse.assertRedirectsTo('/')

    await applicant.refresh()
    assert.equal(applicant.status, 'active')
    assert.equal(applicant.inviteToken, null)
    assert.equal(applicant.inviteTokenExpiresAt, null)

    // Act
    const activeLoginResponse = await loginWithWebForm(client, email, 'NewPassword123!')

    // Assert
    activeLoginResponse.assertRedirectsTo('/tickets')
  })

  test('set-password rejects invalid token', async ({ client }: any) => {
    // Arrange

    // Act
    const invalidGetResponse = await client.get('/set-password/token-invalide')

    // Assert
    invalidGetResponse.assertRedirectsTo('/login')

    // Act
    const invalidPostResponse = await client.post('/set-password/token-invalide').form({
      password: 'NewPassword123!',
      passwordConfirmation: 'NewPassword123!',
    })

    // Assert
    invalidPostResponse.assertRedirectsTo('/login')
  })

  test('set-password rejects expired token and keeps account pending', async ({ client }: any) => {
    // Arrange
    const applicant = await createUser('tenant', 'pending')
    applicant.inviteToken = `expired-${Date.now()}`
    applicant.inviteTokenExpiresAt = DateTime.now().minus({ minutes: 1 })
    await applicant.save()

    // Act
    const response = await client.post(`/set-password/${applicant.inviteToken}`).form({
      password: 'NewPassword123!',
      passwordConfirmation: 'NewPassword123!',
    })

    // Assert
    response.assertRedirectsTo('/login')
    await applicant.refresh()
    assert.equal(applicant.status, 'pending')
  })

  test('set-password token cannot be reused after activation', async ({ client }: any) => {
    // Arrange
    const applicant = await createUser('tenant', 'pending')
    applicant.inviteToken = `single-use-${Date.now()}`
    applicant.inviteTokenExpiresAt = DateTime.now().plus({ days: 1 })
    await applicant.save()

    const token = applicant.inviteToken

    // Act
    const firstAttempt = await client.post(`/set-password/${token}`).form({
      password: 'NewPassword123!',
      passwordConfirmation: 'NewPassword123!',
    })

    // Assert
    firstAttempt.assertRedirectsTo('/')

    await applicant.refresh()
    assert.equal(applicant.status, 'active')

    // Act
    const secondAttempt = await client.post(`/set-password/${token}`).form({
      password: 'AnotherPassword123!',
      passwordConfirmation: 'AnotherPassword123!',
    })

    // Assert
    secondAttempt.assertRedirectsTo('/login')
  })
})
