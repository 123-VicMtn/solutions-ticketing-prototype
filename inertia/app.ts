import './css/app.css'
import 'vue-sonner/style.css'
import { client } from '~/client'
import Layout from '~/layouts/default.vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { TuyauProvider } from '@adonisjs/inertia/vue'
import { createApp, type DefineComponent, h } from 'vue'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

const appName = import.meta.env.VITE_APP_NAME || '123-Immo'

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: (name) => {
    return resolvePageComponent(
      `./pages/${name}.vue`,
      import.meta.glob<DefineComponent>('./pages/**/*.vue'),
      Layout
    )
  },
  setup({ el, App, props, plugin }) {
    const app = createApp({
      render: () => h(TuyauProvider, { client }, { default: () => h(App, props) }),
    })

    if (import.meta.env.DEV) {
      app.config.errorHandler = (err, _instance, info) => {
        console.error(`[Vue error] ${info}:`, err)
      }
    }

    app.use(plugin).mount(el)
  },
  progress: {
    color: '#4B5563',
  },
})
