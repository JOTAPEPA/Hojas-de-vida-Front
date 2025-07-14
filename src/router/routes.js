import signIn from '../views/signIn.vue'
import villanueva from '../views/villanueva.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAdministradorStore } from '../stores/administrador.js'

const routes = [
    {
        path: "/signin",
        name: "signIn",
        component: signIn,
        meta: { requiresGuest: true }
    },
    {
        path: '/',
        name: 'Villanueva',
        component: villanueva,
        meta: { requiresAuth: true }
    },
    // Ruta catch-all para redirigir cualquier ruta no definida
    {
        path: '/:pathMatch(.*)*',
        redirect: '/signin'
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
    const authStore = useAdministradorStore()

    // Inicializar auth si no está inicializado
    if (!authStore.token && !authStore.refreshToken) {
        authStore.initializeAuth()
    }

    const isAuthenticated = authStore.isAuthenticated
    const requiresAuth = to.meta.requiresAuth
    const requiresGuest = to.meta.requiresGuest

    // Reiniciar timer de inactividad en cada navegación si está autenticado
    if (isAuthenticated) {
        authStore.resetInactivityTimer()
    }

    if (requiresAuth && !isAuthenticated) {
        // Ruta requiere autenticación pero el usuario no está autenticado
        next('/signin')
    } else if (requiresGuest && isAuthenticated) {
        // Ruta es solo para invitados pero el usuario está autenticado
        next('/')
    } else if (!requiresAuth && !requiresGuest && !isAuthenticated) {
        // Si no está autenticado y la ruta no tiene meta definida, redirigir a signin
        next('/signin')
    } else {
        // Permitir navegación
        next()
    }
})

