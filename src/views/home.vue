<template>
  <q-page class="q-pa-md">
    <div class="welcome-section q-mb-lg">
      <h1 class="text-h4 q-mb-md">¡Bienvenido!</h1>
      <p class="text-body1 text-grey-7">
        Gestiona tu aplicación desde este panel principal
      </p>
    </div>

    <q-table
      class="my-sticky-header-table"
      flat bordered
      title="Treats"
      :rows="rows"
      :columns="columns"
      row-key="name"
    />
  </q-page>
</template>

<script setup>
// Funcionalidad de logout ahora manejada en App.vue

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Dessert (100g serving)',
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'calories', align: 'center', label: 'Calories', field: 'calories', sortable: true },
  { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true },
  { name: 'carbs', label: 'Carbs (g)', field: 'carbs' },
  { name: 'protein', label: 'Protein (g)', field: 'protein' },
  { name: 'sodium', label: 'Sodium (mg)', field: 'sodium' },
]

const rows = [
  // Aquí puedes agregar datos para la tabla
]
</script>

<style scoped>
.welcome-section {
  text-align: center;
  padding: 20px 0;
}

.my-sticky-header-table {
  border-radius: 10px;
  overflow: hidden;
}
</style>