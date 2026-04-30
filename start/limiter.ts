/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(10).every('1 minute')
})

export const loginThrottle = limiter.define('login', ({ request }) => {
  const email = String(request.input('email', '')).trim().toLowerCase()
  const key = email ? `login:${request.ip()}:${email}` : `login:${request.ip()}`

  return limiter.allowRequests(5).every('1 minute').blockFor('15 minutes').usingKey(key)
})

export const onboardingThrottle = limiter.define('onboarding', ({ request, params }) => {
  const email = String(request.input('email', '')).trim().toLowerCase()
  const token = String(params.token ?? '').trim()
  const identity = token || email || 'anonymous'
  const key = `onboarding:${request.ip()}:${identity}`

  return limiter.allowRequests(5).every('10 minutes').blockFor('30 minutes').usingKey(key)
})
