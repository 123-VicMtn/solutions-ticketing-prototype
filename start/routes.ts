import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
const AccessRequestsController = () => import('#controllers/access_requests_controller')
const ManagerAccessController = () => import('#controllers/manager_access_controller')
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create']).as('new_account.create')
    router.post('signup', [controllers.NewAccount, 'store']).as('new_account.store')

    router.get('login', [controllers.Session, 'create']).as('session.create')
    router.post('login', [controllers.Session, 'store']).as('session.store')

    router.get('request-access', [AccessRequestsController, 'create']).as('request_access.create')
    router.post('request-access', [AccessRequestsController, 'store']).as('request_access.store')
    router
      .get('set-password/:token', [AccessRequestsController, 'setPasswordPage'])
      .as('set_password.create')
    router
      .post('set-password/:token', [AccessRequestsController, 'setPassword'])
      .as('set_password.store')
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy']).as('session.destroy')

    router.get('dashboard', [controllers.Dashboard, 'index']).as('dashboard.index')

    router.get('tickets', [controllers.Tickets, 'index']).as('tickets.index')
    router.get('tickets/create', [controllers.Tickets, 'create']).as('tickets.create')
    router.post('tickets', [controllers.Tickets, 'store']).as('tickets.store')
    router.get('tickets/:id', [controllers.Tickets, 'show']).as('tickets.show')
    router.get('tickets/:id/edit', [controllers.Tickets, 'edit']).as('tickets.edit')
    router.put('tickets/:id', [controllers.Tickets, 'update']).as('tickets.update')
    router
      .put('tickets/:id/status', [controllers.Tickets, 'updateStatus'])
      .as('tickets.status.update')
    router
      .post('tickets/:id/comments', [controllers.Tickets, 'addComment'])
      .as('tickets.comments.store')
    router
      .post('tickets/:id/attachments', [controllers.Tickets, 'addAttachments'])
      .as('tickets.attachments.store')
    router.post('tickets/:id/assign', [controllers.Tickets, 'assign']).as('tickets.assign')
  })
  .use([middleware.auth(), middleware.requireActiveUser()])

router
  .group(() => {
    router.get('users/create', [controllers.Users, 'create']).as('users.create')
    router.get('users', [controllers.Users, 'index']).as('users.index')
    router.get('users/:id', [controllers.Users, 'show']).as('users.show')
    router.get('users/:id/edit', [controllers.Users, 'edit']).as('users.edit')
    router.put('users/:id', [controllers.Users, 'update']).as('users.update')
  })
  .use([middleware.auth(), middleware.requireActiveUser(), middleware.requireRole('manager')])

router
  .group(() => {
    router.get('access-requests', [ManagerAccessController, 'index']).as('access_requests.index')
    router
      .post('access-requests/:id/approve', [ManagerAccessController, 'approve'])
      .as('access_requests.approve')
    router
      .post('access-requests/:id/reject', [ManagerAccessController, 'reject'])
      .as('access_requests.reject')
  })
  .prefix('manager')
  .as('manager')
  .use([middleware.auth(), middleware.requireActiveUser(), middleware.requireRole('manager')])

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

    router.post('users', [controllers.Users, 'store']).as('users.store')
  })
  .prefix('admin')
  .as('admin')
  .use([middleware.auth(), middleware.requireActiveUser(), middleware.requireRole('manager')])
