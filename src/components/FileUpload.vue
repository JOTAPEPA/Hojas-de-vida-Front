<template>
  <div class="file-upload-component">
    <q-input
      v-model="inputValue"
      :label="label"
      :hint="hint"
      outlined
      readonly
      :class="{ 'file-uploaded': fileUrl }"
    >
      <template v-slot:prepend>
        <q-icon :name="getFileIcon()" :color="fileUrl ? 'positive' : 'grey-6'" />
      </template>
      
      <template v-slot:append>
        <q-btn
          flat
          round
          dense
          icon="attach_file"
          @click="triggerFileInput"
          :loading="uploading"
          color="primary"
        >
          <q-tooltip>{{ fileUrl ? 'Cambiar archivo' : 'Seleccionar archivo' }}</q-tooltip>
        </q-btn>
        
        <q-btn
          v-if="fileUrl && !required"
          flat
          round
          dense
          icon="close"
          @click="removeFile"
          color="negative"
          class="q-ml-xs"
        >
          <q-tooltip>Eliminar archivo</q-tooltip>
        </q-btn>
        
        <q-btn
          v-if="fileUrl"
          flat
          round
          dense
          icon="visibility"
          @click="previewFile"
          color="blue"
          class="q-ml-xs"
        >
          <q-tooltip>Ver archivo</q-tooltip>
        </q-btn>
      </template>
    </q-input>

    <!-- Input de archivo oculto -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptedTypes"
      @change="handleFileSelection"
      style="display: none"
    />

    <!-- Indicador de progreso -->
    <q-linear-progress
      v-if="uploading"
      :value="uploadProgress / 100"
      color="primary"
      class="q-mt-sm"
    />
    
    <!-- Información del archivo -->
    <div v-if="fileInfo && fileUrl" class="file-info q-mt-sm">
      <div class="text-caption text-grey-7">
        <q-icon name="info" class="q-mr-xs" />
        {{ fileInfo.filename }} ({{ formatFileSize(fileInfo.size) }})
        <q-chip 
          v-if="fileInfo.format" 
          dense 
          color="blue-1" 
          text-color="primary" 
          class="q-ml-sm"
        >
          {{ fileInfo.format.toUpperCase() }}
        </q-chip>
      </div>
    </div>

    <!-- Vista previa para imágenes -->
    <div v-if="preview && fileType === 'image'" class="preview-container q-mt-sm">
      <q-img
        :src="preview"
        style="max-width: 200px; max-height: 150px"
        class="rounded-borders"
        fit="contain"
      />
    </div>

    <!-- Diálogo de vista previa -->
    <q-dialog v-model="showPreview" maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <div class="text-h6">{{ fileInfo?.filename || 'Vista previa' }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>
        
        <q-card-section class="q-pa-none" style="height: calc(100vh - 50px);">
          <iframe
            v-if="fileUrl && fileType === 'document'"
            :src="fileUrl"
            style="width: 100%; height: 100%; border: none;"
          />
          <q-img
            v-else-if="fileUrl && fileType === 'image'"
            :src="fileUrl"
            style="width: 100%; height: 100%"
            fit="contain"
          />
          <div v-else class="flex flex-center full-height">
            <div class="text-center">
              <q-icon name="description" size="4rem" color="grey-5" />
              <div class="text-h6 q-mt-md">No se puede mostrar vista previa</div>
              <q-btn
                color="primary"
                icon="download"
                label="Descargar archivo"
                @click="downloadFile"
                class="q-mt-md"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import cloudinaryService from '../services/cloudinaryService.js';

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Seleccionar archivo'
  },
  hint: {
    type: String,
    default: 'Formatos permitidos: JPG, PNG, PDF, DOC, DOCX'
  },
  required: {
    type: Boolean,
    default: false
  },
  folder: {
    type: String,
    default: 'employee-documents'
  },
  acceptedTypes: {
    type: String,
    default: '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx'
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'file-uploaded', 'file-removed']);

// Quasar
const $q = useQuasar();

// Referencias reactivas
const fileInput = ref(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const fileUrl = ref(props.modelValue || '');
const fileInfo = ref(null);
const preview = ref(null);
const showPreview = ref(false);

// Computed
const inputValue = computed(() => {
  if (fileUrl.value) {
    return fileInfo.value?.filename || 'Archivo subido';
  }
  return '';
});

const fileType = computed(() => {
  if (!fileInfo.value) return 'unknown';
  return cloudinaryService.getFileType(fileInfo.value.filename || '');
});

// Watchers
watch(() => props.modelValue, (newValue) => {
  fileUrl.value = newValue || '';
  if (!newValue) {
    fileInfo.value = null;
    preview.value = null;
  }
});

// Métodos
function getFileIcon() {
  if (!fileUrl.value) return 'attach_file';
  
  switch (fileType.value) {
    case 'image': return 'image';
    case 'document': return 'description';
    case 'spreadsheet': return 'table_chart';
    default: return 'insert_drive_file';
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}

async function handleFileSelection(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    uploading.value = true;
    uploadProgress.value = 0;

    // Generar vista previa si es imagen
    if (file.type.startsWith('image/')) {
      try {
        preview.value = await cloudinaryService.generatePreview(file);
      } catch (error) {
        console.warn('No se pudo generar vista previa:', error);
      }
    }

    // Subir archivo
    const result = await cloudinaryService.uploadFile(
      file,
      props.folder,
      (progress) => {
        uploadProgress.value = progress;
      }
    );

    if (result.success) {
      fileUrl.value = result.url;
      fileInfo.value = {
        filename: result.original_filename || file.name,
        size: result.bytes || file.size,
        format: result.format,
        public_id: result.public_id
      };

      // Emitir eventos
      emit('update:modelValue', result.url);
      emit('file-uploaded', {
        url: result.url,
        filename: fileInfo.value.filename,
        public_id: result.public_id
      });

      $q.notify({
        message: 'Archivo subido exitosamente',
        color: 'positive',
        icon: 'cloud_upload'
      });
    }

  } catch (error) {
    console.error('Error al subir archivo:', error);
    $q.notify({
      message: error.error || 'Error al subir el archivo',
      color: 'negative',
      icon: 'error'
    });
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
    // Limpiar el input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
}

function removeFile() {
  if (props.required) {
    $q.notify({
      message: 'Este campo es obligatorio y no se puede eliminar',
      color: 'warning'
    });
    return;
  }

  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de que desea eliminar este archivo?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    fileUrl.value = '';
    fileInfo.value = null;
    preview.value = null;
    
    emit('update:modelValue', '');
    emit('file-removed');

    $q.notify({
      message: 'Archivo eliminado',
      color: 'info'
    });
  });
}

function previewFile() {
  if (!fileUrl.value) return;
  showPreview.value = true;
}

function downloadFile() {
  if (!fileUrl.value) return;
  
  const link = document.createElement('a');
  link.href = fileUrl.value;
  link.download = fileInfo.value?.filename || 'archivo';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  return cloudinaryService.formatFileSize(bytes);
}
</script>

<style scoped>
.file-upload-component {
  width: 100%;
}

.file-uploaded .q-field__control {
  background-color: #f0f9ff;
  border-color: #10b981;
}

.file-info {
  background-color: #f8fafc;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.preview-container {
  text-align: center;
}

.preview-container .q-img {
  border: 2px solid #e2e8f0;
}

/* Animaciones */
.file-upload-component {
  transition: all 0.3s ease;
}

.q-linear-progress {
  border-radius: 4px;
}

/* Estados de hover */
.q-btn:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* Responsive */
@media (max-width: 600px) {
  .preview-container .q-img {
    max-width: 100%;
    max-height: 120px;
  }
}
</style>
