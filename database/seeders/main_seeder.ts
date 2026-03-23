import { DateTime } from 'luxon'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Building from '#models/building'
import Unit from '#models/unit'
import UserUnit from '#models/user_unit'
import Provider from '#models/provider'
import Ticket, { type TicketCategory, type TicketPriority, type TicketStatus } from '#models/ticket'
import TicketComment from '#models/ticket_comment'
import TicketAttachment from '#models/ticket_attachment'

export default class MainSeeder extends BaseSeeder {
  async run() {
    const users = await User.createMany([
      {
        firstName: 'Gerance',
        lastName: 'Gerance',
        email: 'admin@ticketing.ch',
        password: 'password123',
        role: 'admin',
        status: 'active',
        phone: '+41 21 500 00 01',
        notificationPreference: 'email',
      },
      {
        firstName: 'Camille',
        lastName: 'Rossier',
        email: 'camille.rossier@ticketing.ch',
        password: 'password123',
        role: 'admin',
        status: 'active',
        phone: '+41 21 500 00 01',
        notificationPreference: 'email',
      },
      {
        firstName: 'Sophie',
        lastName: 'Berset',
        email: 'sophie.berset@ticketing.ch',
        password: 'password123',
        role: 'admin',
        status: 'active',
        phone: '+41 21 500 00 02',
        notificationPreference: 'email',
      },
      {
        firstName: 'Nicolas',
        lastName: 'Molina',
        email: 'nicolas.molina@ticketing.ch',
        password: 'password123',
        role: 'manager',
        status: 'active',
        phone: '+41 21 500 00 03',
        notificationPreference: 'email',
      },
      {
        firstName: 'Isabelle',
        lastName: 'Perret',
        email: 'isabelle.perret@ticketing.ch',
        password: 'password123',
        role: 'manager',
        status: 'active',
        phone: '+41 21 500 00 04',
        notificationPreference: 'email',
      },
      {
        firstName: 'Luca',
        lastName: 'Favre',
        email: 'luca.favre@example.ch',
        password: 'password123',
        role: 'owner',
        status: 'active',
        phone: '+41 79 200 00 01',
        notificationPreference: 'email',
      },
      {
        firstName: 'Emma',
        lastName: 'Monney',
        email: 'emma.monney@example.ch',
        password: 'password123',
        role: 'owner',
        status: 'active',
        phone: '+41 79 200 00 02',
        notificationPreference: 'email',
      },
      {
        firstName: 'David',
        lastName: 'Python',
        email: 'david.python@example.ch',
        password: 'password123',
        role: 'owner',
        status: 'active',
        phone: '+41 79 200 00 03',
        notificationPreference: 'email',
      },
      {
        firstName: 'Julie',
        lastName: 'Pittet',
        email: 'julie.pittet@example.ch',
        password: 'password123',
        role: 'owner',
        status: 'active',
        phone: '+41 79 200 00 04',
        notificationPreference: 'email',
      },
      {
        firstName: 'Antoine',
        lastName: 'Meyer',
        email: 'antoine.meyer@example.ch',
        password: 'password123',
        role: 'owner',
        status: 'active',
        phone: '+41 79 200 00 05',
        notificationPreference: 'email',
      },
      {
        firstName: 'Nora',
        lastName: 'Glauser',
        email: 'nora.glauser@example.ch',
        password: 'password123',
        role: 'owner',
        status: 'active',
        phone: '+41 79 200 00 06',
        notificationPreference: 'email',
      },
      {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'active',
        phone: '+41 79 100 00 01',
        notificationPreference: 'email',
      },
      {
        firstName: 'Jean',
        lastName: 'Martin',
        email: 'jean.martin@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'active',
        phone: '+41 79 100 00 02',
        notificationPreference: 'email',
      },
      {
        firstName: 'Elisa',
        lastName: 'Rochat',
        email: 'elisa.rochat@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'active',
        phone: '+41 79 100 00 03',
        notificationPreference: 'email',
      },
      {
        firstName: 'Lucas',
        lastName: 'Perrin',
        email: 'lucas.perrin@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'active',
        phone: '+41 79 100 00 04',
        notificationPreference: 'email',
      },
      {
        firstName: 'Amina',
        lastName: 'Saidi',
        email: 'amina.saidi@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'active',
        phone: '+41 79 100 00 05',
        notificationPreference: 'email',
      },
      {
        firstName: 'Paul',
        lastName: 'Keller',
        email: 'paul.keller@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'active',
        phone: '+41 79 100 00 06',
        notificationPreference: 'email',
      },
      {
        firstName: 'Sara',
        lastName: 'Mottet',
        email: 'sara.mottet@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'active',
        phone: '+41 79 100 00 07',
        notificationPreference: 'email',
      },
      {
        firstName: 'Hugo',
        lastName: 'Bovet',
        email: 'hugo.bovet@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'active',
        phone: '+41 79 100 00 08',
        notificationPreference: 'email',
      },
      {
        firstName: 'Lea',
        lastName: 'Jaccard',
        email: 'lea.jaccard@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'active',
        phone: '+41 79 100 00 09',
        notificationPreference: 'email',
      },
      {
        firstName: 'Tom',
        lastName: 'Nicolet',
        email: 'tom.nicolet@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'active',
        phone: '+41 79 100 00 10',
        notificationPreference: 'email',
      },
      {
        firstName: 'Chloé',
        lastName: 'Marti',
        email: 'chloe.marti.pending@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'pending',
        phone: '+41 79 110 00 01',
        notificationPreference: 'email',
      },
      {
        firstName: 'Yanis',
        lastName: 'Bourgeois',
        email: 'yanis.bourgeois.pending@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'pending',
        phone: '+41 79 110 00 02',
        notificationPreference: 'email',
      },
      {
        firstName: 'Zoé',
        lastName: 'Gonzalez',
        email: 'zoe.gonzalez.rejected@example.ch',
        password: 'password123',
        role: 'tenant',
        status: 'rejected',
        phone: '+41 79 120 00 01',
        notificationPreference: 'email',
      },
      {
        firstName: 'Sébastien',
        lastName: 'Bauer',
        email: 'sebastien.bauer@example.ch',
        password: 'password123',
        role: 'provider',
        status: 'active',
        phone: '+41 79 300 00 01',
        notificationPreference: 'email',
      },
      {
        firstName: 'Marianne',
        lastName: 'Perrier',
        email: 'marianne.perrier@example.ch',
        password: 'password123',
        role: 'provider',
        status: 'active',
        phone: '+41 79 300 00 02',
        notificationPreference: 'email',
      },
      {
        firstName: 'Romain',
        lastName: 'Dubois',
        email: 'romain.dubois@example.ch',
        password: 'password123',
        role: 'provider',
        status: 'active',
        phone: '+41 79 300 00 03',
        notificationPreference: 'email',
      },
      {
        firstName: 'Aline',
        lastName: 'Schneider',
        email: 'aline.schneider@example.ch',
        password: 'password123',
        role: 'provider',
        status: 'active',
        phone: '+41 79 300 00 04',
        notificationPreference: 'email',
      },
    ])

    const admins = users.filter((user) => user.role === 'admin')
    const managers = users.filter((user) => user.role === 'manager')
    const owners = users.filter((user) => user.role === 'owner' && user.status === 'active')
    const tenants = users.filter((user) => user.role === 'tenant' && user.status === 'active')
    const providerUsers = users.filter((user) => user.role === 'provider')
    const gerances = [...managers, ...admins]

    const buildings = await Building.createMany([
      {
        name: 'Résidence du Parc',
        address: 'Rue du Parc 12',
        city: 'Lausanne',
        postalCode: '1004',
      },
      {
        name: 'Immeuble Jura',
        address: 'Avenue de la Gare 5',
        city: 'Neuchâtel',
        postalCode: '2000',
      },
      {
        name: 'Les Terrasses',
        address: 'Chemin des Fleurs 22',
        city: 'Fribourg',
        postalCode: '1700',
      },
      {
        name: 'Résidence du Rhône',
        address: 'Rue des Alpes 31',
        city: 'Sion',
        postalCode: '1950',
      },
    ])

    const units = await Unit.createMany(
      buildings.flatMap((building, index) => {
        const prefix = index + 1
        return [
          {
            buildingId: building.id,
            label: `Apt ${prefix}01`,
            floor: 1,
            type: 'apartment' as const,
          },
          {
            buildingId: building.id,
            label: `Apt ${prefix}02`,
            floor: 2,
            type: 'apartment' as const,
          },
          {
            buildingId: building.id,
            label: `Apt ${prefix}03`,
            floor: 3,
            type: 'apartment' as const,
          },
          {
            buildingId: building.id,
            label: `Bureau ${prefix}A`,
            floor: 1,
            type: 'commercial' as const,
          },
          {
            buildingId: building.id,
            label: `Parking P${prefix}1`,
            floor: -1,
            type: 'parking' as const,
          },
          {
            buildingId: building.id,
            label: `Cave C${prefix}1`,
            floor: -1,
            type: 'storage' as const,
          },
        ]
      })
    )

    const apartmentUnits = units.filter((unit) => unit.type === 'apartment')
    const parkingAndStorageUnits = units.filter(
      (unit) => unit.type === 'parking' || unit.type === 'storage'
    )

    const userUnitPayload = apartmentUnits.flatMap((unit, index) => [
      { userId: tenants[index % tenants.length].id, unitId: unit.id, relation: 'tenant' as const },
      { userId: owners[index % owners.length].id, unitId: unit.id, relation: 'owner' as const },
    ])

    for (const [index, unit] of parkingAndStorageUnits.entries()) {
      userUnitPayload.push({
        userId: owners[(index + 2) % owners.length].id,
        unitId: unit.id,
        relation: 'owner',
      })
    }

    const userUnits = await UserUnit.createMany(userUnitPayload)
    const tenantLinks = userUnits.filter((row) => row.relation === 'tenant')

    const providers = await Provider.createMany(
      providerUsers.map((providerUser, index) => {
        const gerance = gerances[index % gerances.length]
        return {
          userId: providerUser.id,
          geranceId: gerance.id,
          companyName: ['TechSoleil', 'NettoPro', 'ServiceJura', 'AccesPlus'][index]!,
          speciality: [
            'Technique & Maintenance',
            'Entretien & Nettoyage',
            'Gestion des accès',
            'Administratifs & Contrats',
          ][index]!,
          phone: `+41 21 400 0${index + 1} 00`,
          isActive: true,
        }
      })
    )

    const categories: TicketCategory[] = [
      'Technique & Maintenance',
      'Entretien & Nettoyage',
      'Administratifs & Contrats',
      'Finance & Facturation',
      'Relations & Conflits',
      'Gestion des accès',
      'Déménagement',
      'Urgences',
    ]
    const priorities: TicketPriority[] = ['basse', 'moyenne', 'élevée', 'urgente']
    const statuses: TicketStatus[] = ['ouvert', 'assigné', 'en cours', 'terminé', 'résolu', 'fermé']
    const topics = [
      'Radiateur froid',
      'Interphone muet',
      'Fuite sous évier',
      'Facture de chauffage',
      'Boîte aux lettres bloquée',
      'Nuisances sonores',
      'Porte de garage',
      'Déménagement planifié',
      'Ampoule couloir',
      'Infiltration balcon',
    ]

    const totalTickets = 32
    const tickets: Ticket[] = []

    for (let index = 0; index < totalTickets; index++) {
      const tenantLink = tenantLinks[index % tenantLinks.length]
      const tenant = tenants.find((row) => row.id === tenantLink.userId)!
      const status = statuses[index % statuses.length]
      const category = categories[index % categories.length]
      const priority = priorities[index % priorities.length]
      const title = `${topics[index % topics.length]}`
      const description = `Signalement créé pour ${title.toLowerCase()} dans l'unité ${tenantLink.unitId}.`

      const managementUsers = [...managers, ...admins]
      const defaultAssignee = managementUsers[index % managementUsers.length]

      const provider =
        status === 'en cours' || status === 'terminé' ? providers[index % providers.length] : null
      const assignedTo = status === 'ouvert' ? null : (provider?.geranceId ?? defaultAssignee.id)
      const providerId = provider?.id ?? null

      const ticket = await Ticket.create({
        userId: tenant.id,
        unitId: tenantLink.unitId,
        assignedTo,
        providerId,
        reference: `TK-2026-${String(index + 1).padStart(4, '0')}`,
        category,
        priority,
        status,
        title,
        description,
        resolvedAt:
          status === 'résolu' || status === 'fermé' ? DateTime.now().minus({ days: 1 }) : null,
      })

      tickets.push(ticket)
    }

    let commentsCount = 0
    let attachmentsCount = 0

    for (const [index, ticket] of tickets.entries()) {
      const tenant = tenants.find((row) => row.id === ticket.userId)!
      const managementUsers = [...managers, ...admins]
      const manager =
        ticket.assignedTo !== null
          ? (managementUsers.find((user) => user.id === ticket.assignedTo) ?? managementUsers[0]!)
          : managementUsers[index % managementUsers.length]

      const comments = [
        {
          ticketId: ticket.id,
          userId: tenant.id,
          content: 'Ticket créé par le locataire avec description initiale.',
          isInternal: false,
        },
        {
          ticketId: ticket.id,
          userId: manager.id,
          content: `Prise en charge effectuée par la gérance (statut: ${ticket.status}).`,
          isInternal: false,
        },
      ]

      if (ticket.status !== 'ouvert') {
        comments.push({
          ticketId: ticket.id,
          userId: manager.id,
          content: 'Note interne: suivi planifié avec prestataire externe.',
          isInternal: true,
        })
      }

      await TicketComment.createMany(comments)
      commentsCount += comments.length

      await TicketAttachment.create({
        ticketId: ticket.id,
        userId: tenant.id,
        filePath: `/uploads/tickets/sample-${index + 1}.jpg`,
        originalName: `photo-ticket-${index + 1}.jpg`,
        mimeType: 'image/jpeg',
        sizeBytes: 180_000 + (index + 1) * 1_500,
      })
      attachmentsCount++
    }

    console.log(
      `Seeded: ${users.length} users, ${buildings.length} buildings, ${units.length} units, ${userUnits.length} user_units`
    )
    console.log(
      `Seeded: ${tickets.length} tickets, ${commentsCount} comments, ${attachmentsCount} attachments (total inserts > 50)`
    )
    console.log(`Admin login: ${admins[0].email} / password123`)
    console.log(`Manager login: ${managers[0].email} / password123`)
    console.log(`Provider login: ${providerUsers[0].email} / password123`)
  }
}
