import { test } from '@japa/runner'
import type { MultipartFile } from '@adonisjs/bodyparser/types'
import { TicketAttachmentValidationService } from '#services/ticket_attachment_validation_service'

const service = new TicketAttachmentValidationService()

function mockFile(partial: {
  clientName?: string
  type?: string | null
  subtype?: string | null
  extname?: string
  size?: number
  isValid?: boolean
  errors?: { message: string }[]
}): MultipartFile {
  const clientName = partial.clientName ?? 'file.png'
  const extFromName = clientName.includes('.') ? (clientName.split('.').pop() ?? 'png') : 'png'
  const file = {
    clientName,
    extname: partial.extname ?? extFromName,
    type: partial.type ?? 'image/png',
    subtype: partial.subtype ?? null,
    size: partial.size ?? 100,
    sizeLimit: '10mb' as const,
    allowedExtensions: [] as string[],
    isValid: partial.isValid ?? true,
    errors: partial.errors ?? [],
    validate(this: MultipartFile) {
      /* bodyparser hook; tests control isValid directly */
    },
  }
  return file as MultipartFile
}

test.group('TicketAttachmentValidationService', () => {
  test('returns null when attachments optional and empty', ({ assert }) => {
    const err = service.validate([], { required: false })
    assert.isNull(err)
  })

  test('returns message when required and no files', ({ assert }) => {
    const err = service.validate([], { required: true })
    assert.isString(err)
    assert.include(err!, 'fichier')
  })

  test('rejects disallowed MIME type after extension passes', ({ assert }) => {
    const err = service.validate([mockFile({ clientName: 'doc.pdf', type: 'text/plain' })], {
      required: true,
    })
    assert.isString(err)
    assert.include(err!, 'text/plain')
  })

  test('rejects invalid file from bodyparser validate', ({ assert }) => {
    const err = service.validate(
      [mockFile({ clientName: 'x.exe', isValid: false, errors: [{ message: 'bad' }] })],
      { required: true }
    )
    assert.equal(err, 'bad')
  })

  test('accepts allowed PNG', ({ assert }) => {
    const err = service.validate([mockFile({ type: 'image/png' })], { required: true })
    assert.isNull(err)
  })

  test('accepts application/pdf', ({ assert }) => {
    const err = service.validate([mockFile({ clientName: 'a.pdf', type: 'application/pdf' })], {
      required: true,
    })
    assert.isNull(err)
  })

  test('rejects incomplete MIME (type without subtype)', ({ assert }) => {
    const err = service.validate(
      [mockFile({ clientName: 'axelor_mobile.jpg', type: 'image', extname: 'jpg' })],
      { required: true }
    )
    assert.isString(err)
    assert.include(err!, 'manquant')
  })

  test('accepts image/jpeg when provided as type+subtype', ({ assert }) => {
    const err = service.validate([mockFile({ clientName: 'photo.jpg', type: 'image', subtype: 'jpeg' })], {
      required: true,
    })
    assert.isNull(err)
  })
})
