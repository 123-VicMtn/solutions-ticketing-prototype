import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('buildings', [controllers.Buildings, 'index']).as('buildings.index')
    router.get('buildings/create', [controllers.Buildings, 'create']).as('buildings.create')
    router.post('buildings', [controllers.Buildings, 'store']).as('buildings.store')
    router.get('buildings/:id/edit', [controllers.Buildings, 'edit']).as('buildings.edit')
    router.put('buildings/:id', [controllers.Buildings, 'update']).as('buildings.update')
    router.delete('buildings/:id', [controllers.Buildings, 'destroy']).as('buildings.destroy')

    router.get('units', [controllers.Units, 'index']).as('units.index')
    router.get('units/create', [controllers.Units, 'create']).as('units.create')
    router.post('units', [controllers.Units, 'store']).as('units.store')
    router.get('units/:id/edit', [controllers.Units, 'edit']).as('units.edit')
    router.put('units/:id', [controllers.Units, 'update']).as('units.update')
    router.delete('units/:id', [controllers.Units, 'destroy']).as('units.destroy')
  })
  .prefix('admin')
  .as('admin')
  .use(middleware.auth())
