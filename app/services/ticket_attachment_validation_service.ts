import type { MultipartFile } from '@adonisjs/bodyparser/types'

export class TicketAttachmentValidationService {
  private static readonly MAX_ATTACHMENTS = 5

  private static readonly ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ]

  validate(attachments: MultipartFile[], options: { required: boolean }): string | null {
    if (options.required && attachments.length === 0) {
      return 'Veuillez sélectionner au moins un fichier.'
    }

    if (attachments.length > TicketAttachmentValidationService.MAX_ATTACHMENTS) {
      return `Vous pouvez envoyer au maximum ${TicketAttachmentValidationService.MAX_ATTACHMENTS} fichiers.`
    }

    for (const attachment of attachments) {
      attachment.sizeLimit = '10mb'
      attachment.allowedExtensions = TicketAttachmentValidationService.ALLOWED_EXTENSIONS
      attachment.validate()

      if (!attachment.isValid) {
        return attachment.errors[0]?.message ?? `Le fichier ${attachment.clientName} est invalide.`
      }

      const mimeType = this.getFullMimeType(attachment)
      if (!mimeType) {
        return `Le type MIME est manquant pour ${attachment.clientName}.`
      }

      if (!TicketAttachmentValidationService.ALLOWED_MIME_TYPES.includes(mimeType)) {
        const reported = this.getReportedMimeType(attachment)
        return `Le type MIME ${reported} n'est pas autorisé pour ${attachment.clientName}.`
      }
    }

    return null
  }

  private getFullMimeType(attachment: MultipartFile): string | null {
    const rawType = (attachment.type ?? '').trim().toLowerCase()
    if (!rawType) return null

    if (rawType.includes('/')) {
      return rawType
    }

    const rawSubtype = (attachment as unknown as { subtype?: string | null }).subtype
    const subtype = (rawSubtype ?? '').trim().toLowerCase()
    if (!subtype) return null

    return `${rawType}/${subtype}`
  }

  private getReportedMimeType(attachment: MultipartFile): string {
    const full = this.getFullMimeType(attachment)
    if (full) return full

    const rawType = (attachment.type ?? '').trim()
    const rawSubtype = (attachment as unknown as { subtype?: string | null }).subtype
    const subtype = (rawSubtype ?? '').trim()

    if (rawType && subtype) return `${rawType}/${subtype}`
    if (rawType) return rawType
    return 'inconnu'
  }
}
