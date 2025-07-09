<template>
  <q-page class="flex flex-center">
    <div>
      <h1 class="text-h4 q-mb-md">Página 2</h1>
      <p class="text-body1">
        Esta es la segunda página de tu aplicación. 
        Como puedes ver, el header aparece automáticamente aquí también.
      </p>
      
      <div class="q-mt-lg">
        <q-btn 
          color="primary" 
          label="Volver al Inicio" 
          @click="$router.push('/home')"
          class="q-mr-sm"
        />
        <q-btn 
          color="negative" 
          label="Cerrar Sesión" 
          @click="$router.push('/')"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Contenido específico de la página 2
</script>

<style scoped>
.flex {
  display: flex;
}
.flex-center {
  justify-content: center;
  align-items: center;
}
</style>
