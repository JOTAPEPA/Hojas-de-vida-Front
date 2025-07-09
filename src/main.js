import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { createPinia } from 'pinia'
import { router } from './router/routes.js'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

import './style.css'

import App from './App.vue'

const myApp = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedState)

myApp.use(pinia)
myApp.use(router)
myApp.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})

myApp.mount('#app')
