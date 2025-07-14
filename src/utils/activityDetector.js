import { useAdministradorStore } from '../stores/administrador.js'

// Eventos que consideramos como actividad del usuario
const ACTIVITY_EVENTS = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click'
]

let activityListeners = []

export function startActivityDetection() {
    const authStore = useAdministradorStore()
    
    // Función que se ejecuta cuando hay actividad
    function handleActivity() {
        if (authStore.isAuthenticated) {
            authStore.resetInactivityTimer()
        }
    }
    
    // Throttle para evitar demasiadas llamadas
    let throttleTimer = null
    function throttledHandleActivity() {
        if (throttleTimer) return
        
        throttleTimer = setTimeout(() => {
            handleActivity()
            throttleTimer = null
        }, 1000) // Máximo una vez por segundo
    }
    
    // Agregar listeners para todos los eventos de actividad
    ACTIVITY_EVENTS.forEach(eventName => {
        document.addEventListener(eventName, throttledHandleActivity, true)
        activityListeners.push({ eventName, handler: throttledHandleActivity })
    })
}

export function stopActivityDetection() {
    // Remover todos los listeners
    activityListeners.forEach(({ eventName, handler }) => {
        document.removeEventListener(eventName, handler, true)
    })
    activityListeners = []
}
