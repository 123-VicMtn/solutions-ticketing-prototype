import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Building from '#models/building'
import Unit from '#models/unit'
import UserUnit from '#models/user_unit'

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

    const tenant1 = await User.create({
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie.dupont@example.ch',
      password: 'password123',
      role: 'tenant',
      phone: '+41 79 100 00 01',
      notificationPreference: 'email',
    })

    const tenant2 = await User.create({
      firstName: 'Jean',
      lastName: 'Martin',
      email: 'jean.martin@example.ch',
      password: 'password123',
      role: 'tenant',
      phone: '+41 79 100 00 02',
      notificationPreference: 'email',
    })

    const owner = await User.create({
      firstName: 'Pierre',
      lastName: 'Favre',
      email: 'pierre.favre@example.ch',
      password: 'password123',
      role: 'owner',
      phone: '+41 79 200 00 01',
      notificationPreference: 'email',
    })

    const building1 = await Building.create({
      name: 'Résidence des Alpes',
      address: 'Rue du Lac 12',
      city: 'Lausanne',
      postalCode: '1000',
    })

    const building2 = await Building.create({
      name: 'Immeuble Jura',
      address: 'Avenue de la Gare 5',
      city: 'Neuchâtel',
      postalCode: '2000',
    })

    const unit1a = await Unit.create({
      buildingId: building1.id,
      label: 'Apt 1A',
      floor: 1,
      type: 'apartment',
    })

    const unit1b = await Unit.create({
      buildingId: building1.id,
      label: 'Apt 2B',
      floor: 2,
      type: 'apartment',
    })

    await Unit.create({
      buildingId: building1.id,
      label: 'Parking P01',
      floor: -1,
      type: 'parking',
    })

    await Unit.create({
      buildingId: building1.id,
      label: 'Cave C01',
      floor: -1,
      type: 'storage',
    })

    const unit2a = await Unit.create({
      buildingId: building2.id,
      label: 'Apt 1A',
      floor: 1,
      type: 'apartment',
    })

    await Unit.create({
      buildingId: building2.id,
      label: 'Bureau 3A',
      floor: 3,
      type: 'commercial',
    })

    await UserUnit.createMany([
      { userId: tenant1.id, unitId: unit1a.id, relation: 'tenant' },
      { userId: tenant2.id, unitId: unit1b.id, relation: 'tenant' },
      { userId: tenant2.id, unitId: unit2a.id, relation: 'tenant' },
      { userId: owner.id, unitId: unit1a.id, relation: 'owner' },
      { userId: owner.id, unitId: unit1b.id, relation: 'owner' },
      { userId: owner.id, unitId: unit2a.id, relation: 'owner' },
    ])

    console.log('Seeded: 1 admin, 2 tenants, 1 owner, 2 buildings, 6 units, 6 user_units')
    console.log(`Admin login: ${admin.email} / password123`)
  }
}
