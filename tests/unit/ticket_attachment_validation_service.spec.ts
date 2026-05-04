import { test } from '@japa/runner'
import type { MultipartFile } from '@adonisjs/bodyparser/types'
import { TicketAttachmentValidationService } from '#services/ticket_attachment_validation_service'

const service = new TicketAttachmentValidationService()

function mockFile(partial: {
  clientName?: string
  type?: string | null
  size?: number
  isValid?: boolean
  errors?: { message: string }[]
}): MultipartFile {
  const clientName = partial.clientName ?? 'file.png'
  const file = {
    clientName,
    type: partial.type ?? 'image/png',
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
})
