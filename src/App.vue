<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header condicional - se muestra en todas las rutas excepto signIn -->
    <q-header v-if="showHeader" bordered class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8iGDQ6VWECRIntbY5F6ZBYz-wCHgqzXM_FA&s">
          </q-avatar>
          Copvillanueva
        </q-toolbar-title>
        
        <!-- Información del usuario y cerrar sesión -->
        <q-space />
        <div v-if="authStore.isAuthenticated" class="user-info-header">
          <div class="user-details">
            <div class="user-name">{{ authStore.user?.name || 'Usuario' }}</div>
            <div class="user-email">{{ authStore.user?.email }}</div>
          </div>
          <q-btn 
            flat 
            dense 
            icon="logout" 
            @click="handleLogout"
            class="q-ml-md"
          >
            <q-tooltip>Cerrar Sesión</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/" label="Inicio" />
        <q-route-tab to="/page2" label="Página 2" />
        <q-route-tab to="/page3" label="Página 3" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdministradorStore } from './stores/administrador.js'

const route = useRoute()
const router = useRouter()
const authStore = useAdministradorStore()

// Inicializar auth al cargar la aplicación
authStore.initializeAuth()

// Computed property para mostrar/ocultar header
const showHeader = computed(() => {
  // Lista de rutas donde NO queremos mostrar el header
  const routesWithoutHeader = ['signIn']
  return !routesWithoutHeader.includes(route.name)
})

// Función para manejar el logout
const handleLogout = () => {
  authStore.logout()
  router.push('/signin')
}
</script>

<style scoped>
.user-info-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-details {
  text-align: right;
  line-height: 1.2;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.user-email {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .user-details {
    display: none;
  }
}
</style>