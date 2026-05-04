import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import testUtils from '@adonisjs/core/services/test_utils'
import User, { type UserRole } from '#models/user'
import Building from '#models/building'
import Unit from '#models/unit'
import UserUnit from '#models/user_unit'
import Ticket from '#models/ticket'
import TicketAttachment from '#models/ticket_attachment'

const specDir = dirname(fileURLToPath(import.meta.url))
const PNG_FIXTURE = join(specDir, '../fixtures/one-pixel.png')

const DEFAULT_PASSWORD = 'Password123!'

async function createUser(role: UserRole) {
  return User.create({
    role,
    status: 'active',
    firstName: role,
    lastName: 'user',
    email: `${role}.${DateTime.now().toMillis()}.${Math.random()}@example.test`,
    phone: null,
    notificationPreference: 'email',
    password: DEFAULT_PASSWORD,
    inviteToken: null,
    inviteTokenExpiresAt: null,
  })
}

async function loginWithWebForm(
  client: { post: (url: string) => { form: (v: object) => Promise<unknown> } },
  email: string,
  password: string
) {
  return client.post('/login').form({ email, password })
}

async function seedBuildingUnit() {
  const building = await Building.create({
    name: 'Test Tower',
    address: '1 Rue du Test',
    city: 'Lausanne',
    postalCode: '1000',
  })
  const unit = await Unit.create({
    buildingId: building.id,
    label: '1.1',
    floor: 1,
    type: 'apartment',
  })
  return { building, unit }
}

test.group('Ticket attachments HTTP', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('manager uploads attachment then read redirects to storage read URL', async ({
    client,
    assert,
  }) => {
    const manager = await createUser('manager')
    const { unit } = await seedBuildingUnit()
    const ticket = await Ticket.create({
      userId: manager.id,
      unitId: unit.id,
      category: 'Technique & Maintenance',
      priority: 'moyenne',
      status: 'ouvert',
      title: 'Fixture ticket title',
      description: 'Fixture ticket description long enough.',
    })
    ticket.reference = `TK-${DateTime.now().year}-${String(ticket.id).padStart(4, '0')}`
    await ticket.save()

    await loginWithWebForm(client, manager.email!, DEFAULT_PASSWORD)

    const uploadResponse = await client
      .post(`/tickets/${ticket.id}/attachments`)
      .file('attachments', PNG_FIXTURE, { contentType: 'image/png', filename: 'note.png' })
      .redirects(0)
      .send()

    uploadResponse.assertFound()
    uploadResponse.assertRedirectsTo(`/tickets/${ticket.id}`)

    const attachment = await TicketAttachment.query().where('ticketId', ticket.id).firstOrFail()
    assert.isString(attachment.storageKey)
    assert.isNotNull(attachment.storageKey)

    const readResponse = await client
      .get(`/tickets/${ticket.id}/attachments/${attachment.id}/read`)
      .redirects(0)
      .send()

    readResponse.assertFound()
    const location = readResponse.header('location') ?? ''
    assert.isTrue(location.length > 0, 'read endpoint should redirect')
    assert.include(
      decodeURIComponent(location),
      attachment.storageKey!,
      'redirect target should reference the stored object key'
    )
  })

  test('other tenant cannot read attachment', async ({ client }) => {
    const tenantA = await createUser('tenant')
    const tenantB = await createUser('tenant')
    const { unit } = await seedBuildingUnit()
    await UserUnit.create({ userId: tenantA.id, unitId: unit.id })

    const ticket = await Ticket.create({
      userId: tenantA.id,
      unitId: unit.id,
      category: 'Urgences',
      priority: 'basse',
      status: 'ouvert',
      title: 'Tenant A issue title',
      description: 'Tenant A issue description text.',
    })
    ticket.reference = `TK-${DateTime.now().year}-${String(ticket.id).padStart(4, '0')}`
    await ticket.save()

    await TicketAttachment.create({
      ticketId: ticket.id,
      userId: tenantA.id,
      filePath: null,
      storageDriver: 'local',
      storageKey: 'fake-key.png',
      checksumSha256: null,
      originalName: 'x.png',
      mimeType: 'image/png',
      sizeBytes: 10,
    })
    const attachment = await TicketAttachment.findByOrFail('ticketId', ticket.id)

    await loginWithWebForm(client, tenantB.email!, DEFAULT_PASSWORD)

    const readResponse = await client
      .get(`/tickets/${ticket.id}/attachments/${attachment.id}/read`)
      .send()

    readResponse.assertForbidden()
  })

  test('read returns 404 when attachment has no storage key', async ({ client }) => {
    const manager = await createUser('manager')
    const { unit } = await seedBuildingUnit()
    const ticket = await Ticket.create({
      userId: manager.id,
      unitId: unit.id,
      category: 'Administratifs & Contrats',
      priority: 'moyenne',
      status: 'ouvert',
      title: 'Legacy row ticket title',
      description: 'Legacy row ticket description here.',
    })
    ticket.reference = `TK-${DateTime.now().year}-${String(ticket.id).padStart(4, '0')}`
    await ticket.save()

    await TicketAttachment.create({
      ticketId: ticket.id,
      userId: manager.id,
      filePath: null,
      storageDriver: null,
      storageKey: null,
      checksumSha256: null,
      originalName: 'old.bin',
      mimeType: 'application/octet-stream',
      sizeBytes: 1,
    })
    const attachment = await TicketAttachment.findByOrFail('ticketId', ticket.id)

    await loginWithWebForm(client, manager.email!, DEFAULT_PASSWORD)

    const readResponse = await client
      .get(`/tickets/${ticket.id}/attachments/${attachment.id}/read`)
      .send()

    readResponse.assertNotFound()
  })

  test('guest is redirected to login for read endpoint', async ({ client }) => {
    const readResponse = await client.get('/tickets/1/attachments/1/read').redirects(0).send()

    readResponse.assertFound()
    readResponse.assertRedirectsTo('/login')
  })

  test('upload rejects disallowed MIME with redirect and flash (Inertia)', async ({ client }) => {
    const manager = await createUser('manager')
    const { unit } = await seedBuildingUnit()
    const ticket = await Ticket.create({
      userId: manager.id,
      unitId: unit.id,
      category: 'Finance & Facturation',
      priority: 'moyenne',
      status: 'ouvert',
      title: 'Upload reject ticket title',
      description: 'Upload reject ticket description.',
    })
    ticket.reference = `TK-${DateTime.now().year}-${String(ticket.id).padStart(4, '0')}`
    await ticket.save()

    const dir = mkdtempSync(join(tmpdir(), 'pj-test-'))
    const fakePdfPath = join(dir, 'fake.pdf')
    writeFileSync(fakePdfPath, 'not a pdf')

    await loginWithWebForm(client, manager.email!, DEFAULT_PASSWORD)

    const uploadResponse = await client
      .post(`/tickets/${ticket.id}/attachments`)
      .file('attachments', fakePdfPath, { contentType: 'text/plain', filename: 'fake.pdf' })
      .redirects(0)
      .send()

    uploadResponse.assertFound()
    uploadResponse.assertRedirectsTo(`/tickets/${ticket.id}`)
  })
})
