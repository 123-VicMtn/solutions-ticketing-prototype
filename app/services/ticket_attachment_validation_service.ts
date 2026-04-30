import type { MultipartFile } from '@adonisjs/bodyparser/types'

export class TicketAttachmentValidationService {
  private static readonly MAX_ATTACHMENTS = 5

  private static readonly ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']

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
    }

    return null
  }
}
