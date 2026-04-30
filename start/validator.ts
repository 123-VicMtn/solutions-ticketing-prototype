/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { VineDate } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider(
  {
    'required': 'Le champ {{ field }} est requis',
    'string': 'Le champ {{ field }} doit être une chaîne de caractères',
    'email': "L'adresse email n'est pas valide",
    'minLength': 'Le champ {{ field }} doit contenir au moins {{ min }} caractères',
    'maxLength': 'Le champ {{ field }} ne doit pas dépasser {{ max }} caractères',
    'confirmed': 'La confirmation ne correspond pas',
    'enum': 'La valeur sélectionnée pour {{ field }} est invalide',
    'number': 'Le champ {{ field }} doit être un nombre',
    'positive': 'Le champ {{ field }} doit être un nombre positif',
    'array': 'Le champ {{ field }} doit être une liste',
    'minLength.array': 'Le champ {{ field }} doit contenir au moins {{ min }} élément(s)',
    'maxLength.array': 'Le champ {{ field }} ne doit pas dépasser {{ max }} élément(s)',
    'file': 'Le champ {{ field }} doit être un fichier valide',
    'file.size': 'Le fichier {{ field }} dépasse la taille maximale autorisée',
    'file.extname': 'Le fichier {{ field }} a un format non autorisé',
    'database.unique': 'Cette valeur est déjà utilisée',
    'database.exists': "Cette valeur n'existe pas",

    'email.email': "L'adresse email n'est pas valide",
    'email.database.unique': 'Cette adresse email est déjà utilisée',
    'password.minLength': 'Le mot de passe doit contenir au moins {{ min }} caractères',
    'password.maxLength': 'Le mot de passe ne doit pas dépasser {{ max }} caractères',
    'password.confirmed': 'La confirmation du mot de passe ne correspond pas',
  },
  {
    firstName: 'prénom',
    lastName: 'nom',
    email: 'email',
    phone: 'téléphone',
    role: 'rôle',
    notificationPreference: 'préférence de notification',
    password: 'mot de passe',
    passwordConfirmation: 'confirmation du mot de passe',
    unitId: 'unité',
    reason: 'raison',
    attachments: 'pièces jointes',
  }
)

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))
