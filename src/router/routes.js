import signIn from '../views/signIn.vue'
import home from '../views/home.vue'
import page2 from '../views/page2.vue'
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
        name: 'home',
        component: home,
        meta: { requiresAuth: true }
    },
    {
        path: '/page2',
        name: 'page2',
        component: page2,
        meta: { requiresAuth: true }
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

    if (requiresAuth && !isAuthenticated) {
        // Ruta requiere autenticación pero el usuario no está autenticado
        next('/signin')
    } else if (requiresGuest && isAuthenticated) {
        // Ruta es solo para invitados pero el usuario está autenticado
        next('/')
    } else {
        // Permitir navegación
        next()
    }
})

