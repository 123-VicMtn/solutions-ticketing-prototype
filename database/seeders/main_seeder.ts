import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Building from '#models/building'
import Unit from '#models/unit'
import UserUnit from '#models/user_unit'
import Ticket from '#models/ticket'
import TicketComment from '#models/ticket_comment'
import TicketAttachment from '#models/ticket_attachment'

export default class MainSeeder extends BaseSeeder {
  async run() {
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'Gérance',
      email: 'admin@ticketing.ch',
      password: 'password123',
      role: 'admin',
      phone: '+41 21 123 45 67',
      notificationPreference: 'email',
    })

    const admin2 = await User.create({
      firstName: 'Sophie',
      lastName: 'Berset',
      email: 'sophie.berset@ticketing.ch',
      password: 'password123',
      role: 'admin',
      phone: '+41 21 123 45 68',
      notificationPreference: 'email',
    })

    const tenants = await User.createMany([
      {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@example.ch',
        password: 'password123',
        role: 'tenant',
        phone: '+41 79 100 00 01',
        notificationPreference: 'email',
      },
      {
        firstName: 'Jean',
        lastName: 'Martin',
        email: 'jean.martin@example.ch',
        password: 'password123',
        role: 'tenant',
        phone: '+41 79 100 00 02',
        notificationPreference: 'email',
      },
      {
        firstName: 'Nora',
        lastName: 'Rochat',
        email: 'nora.rochat@example.ch',
        password: 'password123',
        role: 'tenant',
        phone: '+41 79 100 00 03',
        notificationPreference: 'email',
      },
      {
        firstName: 'Lucas',
        lastName: 'Perrin',
        email: 'lucas.perrin@example.ch',
        password: 'password123',
        role: 'tenant',
        phone: '+41 79 100 00 04',
        notificationPreference: 'email',
      },
      {
        firstName: 'Elisa',
        lastName: 'Meyer',
        email: 'elisa.meyer@example.ch',
        password: 'password123',
        role: 'tenant',
        phone: '+41 79 100 00 05',
        notificationPreference: 'email',
      },
    ])

    const owners = await User.createMany([
      {
        firstName: 'Pierre',
        lastName: 'Favre',
        email: 'pierre.favre@example.ch',
        password: 'password123',
        role: 'owner',
        phone: '+41 79 200 00 01',
        notificationPreference: 'email',
      },
      {
        firstName: 'Camille',
        lastName: 'Monney',
        email: 'camille.monney@example.ch',
        password: 'password123',
        role: 'owner',
        phone: '+41 79 200 00 02',
        notificationPreference: 'email',
      },
    ])

    const buildings = await Building.createMany([
      {
        name: 'Résidence des Alpes',
        address: 'Rue du Lac 12',
        city: 'Lausanne',
        postalCode: '1000',
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
    ])

    const units = await Unit.createMany([
      { buildingId: buildings[0].id, label: 'Apt 1A', floor: 1, type: 'apartment' },
      { buildingId: buildings[0].id, label: 'Apt 2B', floor: 2, type: 'apartment' },
      { buildingId: buildings[0].id, label: 'Apt 3C', floor: 3, type: 'apartment' },
      { buildingId: buildings[0].id, label: 'Parking P01', floor: -1, type: 'parking' },
      { buildingId: buildings[0].id, label: 'Cave C01', floor: -1, type: 'storage' },
      { buildingId: buildings[1].id, label: 'Apt 1A', floor: 1, type: 'apartment' },
      { buildingId: buildings[1].id, label: 'Apt 2A', floor: 2, type: 'apartment' },
      { buildingId: buildings[1].id, label: 'Bureau 3A', floor: 3, type: 'commercial' },
      { buildingId: buildings[1].id, label: 'Parking P11', floor: -1, type: 'parking' },
      { buildingId: buildings[2].id, label: 'Apt 1D', floor: 1, type: 'apartment' },
      { buildingId: buildings[2].id, label: 'Apt 2D', floor: 2, type: 'apartment' },
      { buildingId: buildings[2].id, label: 'Cave C21', floor: -1, type: 'storage' },
    ])

    await UserUnit.createMany([
      { userId: tenants[0].id, unitId: units[0].id, relation: 'tenant' },
      { userId: tenants[1].id, unitId: units[1].id, relation: 'tenant' },
      { userId: tenants[2].id, unitId: units[5].id, relation: 'tenant' },
      { userId: tenants[3].id, unitId: units[6].id, relation: 'tenant' },
      { userId: tenants[4].id, unitId: units[9].id, relation: 'tenant' },
      { userId: owners[0].id, unitId: units[0].id, relation: 'owner' },
      { userId: owners[0].id, unitId: units[1].id, relation: 'owner' },
      { userId: owners[0].id, unitId: units[5].id, relation: 'owner' },
      { userId: owners[1].id, unitId: units[6].id, relation: 'owner' },
      { userId: owners[1].id, unitId: units[9].id, relation: 'owner' },
      { userId: owners[1].id, unitId: units[10].id, relation: 'owner' },
    ])

    const ticketSeed = [
      {
        user: tenants[0],
        unit: units[0],
        category: 'Technique & Maintenance',
        priority: 'élevée',
        status: 'ouvert',
        title: 'Radiateur salon froid',
        description: 'Le radiateur du salon reste froid malgré la purge effectuée.',
      },
      {
        user: tenants[1],
        unit: units[1],
        category: 'Urgences',
        priority: 'urgente',
        status: 'en_cours',
        title: 'Fuite sous évier cuisine',
        description: 'Fuite continue sous l’évier, sol mouillé depuis ce matin.',
      },
      {
        user: tenants[2],
        unit: units[5],
        category: 'Technique & Maintenance',
        priority: 'moyenne',
        status: 'assigné',
        title: 'Prise salon ne fonctionne plus',
        description: 'Deux prises ne répondent plus même après test du disjoncteur.',
      },
      {
        user: tenants[3],
        unit: units[6],
        category: 'Entretien & Nettoyage',
        priority: 'basse',
        status: 'résolu',
        title: 'Ampoule couloir à remplacer',
        description: 'L’ampoule du couloir d’étage est hors service.',
      },
      {
        user: tenants[4],
        unit: units[9],
        category: 'Technique & Maintenance',
        priority: 'moyenne',
        status: 'ouvert',
        title: 'Bruit ventilation',
        description: 'La ventilation émet un bruit intermittent la nuit.',
      },
      {
        user: tenants[0],
        unit: units[0],
        category: 'Technique & Maintenance',
        priority: 'élevée',
        status: 'fermé',
        title: 'Pression douche très faible',
        description: 'Faible pression d’eau chaude dans la salle de bain.',
      },
      {
        user: tenants[1],
        unit: units[1],
        category: 'Technique & Maintenance',
        priority: 'basse',
        status: 'ouvert',
        title: 'Poignée porte entrée desserrée',
        description: 'La poignée principale est desserrée et bouge beaucoup.',
      },
      {
        user: tenants[2],
        unit: units[5],
        category: 'Technique & Maintenance',
        priority: 'moyenne',
        status: 'en_cours',
        title: 'Thermostat instable',
        description: 'Température affichée varie fortement sans changement manuel.',
      },
      {
        user: tenants[3],
        unit: units[6],
        category: 'Technique & Maintenance',
        priority: 'élevée',
        status: 'assigné',
        title: 'Disjoncteur saute le soir',
        description: 'Le disjoncteur principal saute lorsque four et plaques sont utilisés.',
      },
      {
        user: tenants[4],
        unit: units[9],
        category: 'Gestion des accès',
        priority: 'moyenne',
        status: 'résolu',
        title: 'Interphone ne sonne pas',
        description: 'Interphone muet depuis plusieurs jours.',
      },
      {
        user: tenants[0],
        unit: units[0],
        category: 'Gestion des accès',
        priority: 'basse',
        status: 'ouvert',
        title: 'Boîte aux lettres bloquée',
        description: 'La serrure de la boîte aux lettres accroche à l’ouverture.',
      },
      {
        user: tenants[1],
        unit: units[1],
        category: 'Technique & Maintenance',
        priority: 'moyenne',
        status: 'assigné',
        title: 'Evacuation lavabo lente',
        description: 'L’eau s’écoule très lentement dans la salle de bain.',
      },
    ]

    let ticketIndex = 1
    for (const seed of ticketSeed) {
      const ticket = await Ticket.create({
        userId: seed.user.id,
        unitId: seed.unit.id,
        category: seed.category,
        priority: seed.priority,
        status: seed.status,
        title: seed.title,
        description: seed.description,
        reference: `TK-2026-${String(ticketIndex).padStart(4, '0')}`,
      })

      await TicketComment.createMany([
        {
          ticketId: ticket.id,
          userId: seed.user.id,
          content: 'Ticket créé par le locataire avec description initiale.',
          isInternal: false,
        },
        {
          ticketId: ticket.id,
          userId: admin.id,
          content: `Analyse initiale effectuée par la gérance (statut: ${seed.status}).`,
          isInternal: false,
        },
        {
          ticketId: ticket.id,
          userId: admin2.id,
          content: 'Note interne: vérifier historique des interventions précédentes.',
          isInternal: true,
        },
      ])

      await TicketAttachment.create({
        ticketId: ticket.id,
        userId: seed.user.id,
        filePath: `/uploads/tickets/sample-${ticketIndex}.jpg`,
        originalName: `photo-ticket-${ticketIndex}.jpg`,
        mimeType: 'image/jpeg',
        sizeBytes: 180_000 + ticketIndex * 1000,
      })

      ticketIndex++
    }

    console.log('Seeded: 2 admins, 5 tenants, 2 owners, 3 buildings, 12 units, 11 user_units')
    console.log('Seeded: 12 tickets, 36 comments, 12 attachments')
    console.log(`Admin login: ${admin.email} / password123`)
  }
}
