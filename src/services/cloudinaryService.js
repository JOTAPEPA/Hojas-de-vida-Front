import axios from 'axios';

/**
 * Servicio para manejar la subida de archivos a Cloudinary a través del backend
 */
export class CloudinaryService {
  constructor() {
    // URL directa al servidor de upload (separado del API principal)
    this.uploadUrl = 'http://localhost:3999/api/upload';
    
    // Crear una instancia de axios específica para uploads
    this.uploadClient = axios.create({
      baseURL: 'http://localhost:3999/api',
      timeout: 30000, // 30 segundos para uploads
    });
  }

  /**
   * Sube un archivo a Cloudinary
   * @param {File} file - Archivo a subir
   * @param {string} folder - Carpeta en Cloudinary (opcional)
   * @param {Function} onProgress - Callback para el progreso de subida
   * @returns {Promise<Object>} - Respuesta con la URL del archivo subido
   */
  async uploadFile(file, folder = 'employee-documents', onProgress = null) {
    try {
      // Validar el archivo
      this.validateFile(file);
      
      console.log('Iniciando subida de archivo:', {
        name: file.name,
        size: file.size,
        type: file.type,
        folder: folder
      });

      // Crear FormData
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('folder', folder);

      // Configurar el progreso y la petición
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && typeof onProgress === 'function') {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      };

      console.log('Enviando archivo al servidor:', this.uploadUrl);
      
      // Realizar la subida usando axios directamente
      const response = await this.uploadClient.post('/upload', formData, config);
      
      console.log('Respuesta completa del servidor:', response);
      console.log('Datos de la respuesta:', response.data);
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && (response.data.secure_url || response.data.url)) {
        const result = {
          success: true,
          url: response.data.secure_url || response.data.url,
          public_id: response.data.public_id || null,
          original_filename: response.data.original_filename || file.name,
          format: response.data.format || null,
          bytes: response.data.bytes || file.size
        };
        
        console.log('Upload exitoso:', result);
        return result;
      } else {
        console.error('Estructura de respuesta inesperada:', response.data);
        throw new Error(`Respuesta inválida del servidor. Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      }

    } catch (error) {
      console.error('Error detallado en uploadFile:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un error
        console.error('Error de respuesta del servidor:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        throw {
          success: false,
          error: `Error del servidor (${error.response.status}): ${error.response.data?.error || error.response.statusText}`,
          details: error
        };
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        console.error('No se recibió respuesta del servidor:', error.request);
        throw {
          success: false,
          error: 'No se pudo conectar con el servidor. Verifique que el backend esté funcionando en http://localhost:3000',
          details: error
        };
      } else {
        // Error en la configuración de la petición
        console.error('Error en la configuración:', error.message);
        throw {
          success: false,
          error: error.message || 'Error al subir el archivo',
          details: error
        };
      }
    }
  }

  /**
   * Sube múltiples archivos a Cloudinary
   * @param {FileList|Array} files - Lista de archivos a subir
   * @param {string} folder - Carpeta en Cloudinary
   * @param {Function} onProgress - Callback para el progreso general
   * @returns {Promise<Array>} - Array con las respuestas de cada archivo
   */
  async uploadMultipleFiles(files, folder = 'employee-documents', onProgress = null) {
    const results = [];
    const fileArray = Array.from(files);
    
    for (let i = 0; i < fileArray.length; i++) {
      try {
        const file = fileArray[i];
        const fileProgress = (percent) => {
          if (onProgress) {
            const overallProgress = ((i / fileArray.length) * 100) + (percent / fileArray.length);
            onProgress(Math.round(overallProgress));
          }
        };

        const result = await this.uploadFile(file, folder, fileProgress);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error.message || `Error al subir archivo ${i + 1}`,
          filename: fileArray[i].name
        });
      }
    }

    return results;
  }

  /**
   * Valida un archivo antes de subirlo
   * @param {File} file - Archivo a validar
   */
  validateFile(file) {
    if (!file) {
      throw new Error('No se ha seleccionado ningún archivo');
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo permitido: 10MB');
    }

    // Validar tipos de archivo permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Formatos permitidos: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX');
    }
  }

  /**
   * Obtiene el tipo de archivo basado en la extensión
   * @param {string} filename - Nombre del archivo
   * @returns {string} - Tipo de archivo
   */
  getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const documentExtensions = ['pdf', 'doc', 'docx'];
    const spreadsheetExtensions = ['xls', 'xlsx'];

    if (imageExtensions.includes(extension)) return 'image';
    if (documentExtensions.includes(extension)) return 'document';
    if (spreadsheetExtensions.includes(extension)) return 'spreadsheet';
    
    return 'unknown';
  }

  /**
   * Genera una vista previa del archivo
   * @param {File} file - Archivo para generar vista previa
   * @returns {Promise<string>} - URL de la vista previa
   */
  generatePreview(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(null); // No generar vista previa para archivos no imagen
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Error al generar vista previa'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Formatea el tamaño del archivo
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} - Tamaño formateado
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Exportar una instancia por defecto
export default new CloudinaryService();
