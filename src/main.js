import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import { createPinia } from 'pinia'
import { router } from './router/routes.js'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import { startActivityDetection } from './utils/activityDetector.js'
// Importar la configuración de Firebase

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
  plugins: {
    Notify,
    Dialog
  }, // import Quasar plugins and add here
})

myApp.mount('#app')

// Inicializar detección de actividad del usuario
startActivityDetection()
