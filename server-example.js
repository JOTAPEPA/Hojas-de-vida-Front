const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173', // URL de tu aplicación Vue
  credentials: true
}));

app.use(express.json());

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: 'TU_CLOUD_NAME',      // Reemplaza con tu cloud_name
  api_key: 'TU_API_KEY',            // Reemplaza con tu api_key
  api_secret: 'TU_API_SECRET'       // Reemplaza con tu api_secret
});

// Configuración de multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// Ruta para subir archivos
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se encontró archivo en la solicitud'
      });
    }

    console.log('Archivo recibido:', {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Determinar el tipo de recurso basado en el tipo MIME
    let resourceType = 'auto';
    if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (req.file.mimetype === 'application/pdf' || 
               req.file.mimetype.includes('document')) {
      resourceType = 'raw';
    }

    // Crear un nombre único para el archivo
    const timestamp = Date.now();
    const originalName = path.parse(req.file.originalname).name;
    const extension = path.parse(req.file.originalname).ext;
    const publicId = `empleados/${originalName}_${timestamp}`;

    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          public_id: publicId,
          folder: 'empleados',
          use_filename: true,
          unique_filename: true,
          overwrite: false
        },
        (error, result) => {
          if (error) {
            console.error('Error en Cloudinary:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    console.log('Archivo subido exitosamente a Cloudinary:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type
    });

    // Respuesta exitosa
    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        original_filename: req.file.originalname,
        resource_type: result.resource_type,
        bytes: result.bytes,
        format: result.format,
        created_at: result.created_at
      }
    });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    
    let errorMessage = 'Error interno del servidor';
    if (error.message.includes('Invalid image file')) {
      errorMessage = 'Archivo de imagen inválido';
    } else if (error.message.includes('File size too large')) {
      errorMessage = 'El archivo es demasiado grande';
    } else if (error.message.includes('Invalid API key')) {
      errorMessage = 'Configuración de Cloudinary inválida';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
});

// Ruta para eliminar archivos (opcional)
app.delete('/delete/:publicId', async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/,/g, '/'); // Manejar IDs con barras

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Archivo eliminado exitosamente'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Archivo no encontrado'
      });
    }
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar archivo',
      details: error.message
    });
  }
});

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores de multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande (máximo 10MB)'
      });
    }
  }
  
  if (error.message === 'Tipo de archivo no permitido') {
    return res.status(400).json({
      success: false,
      error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, PDF, DOC, DOCX'
    });
  }

  console.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
  console.log(`📁 Endpoint de upload: http://localhost:${port}/upload`);
  console.log(`🧪 Endpoint de prueba: http://localhost:${port}/test`);
  console.log('');
  console.log('📋 Configuración requerida:');
  console.log('1. Instalar dependencias: npm install express multer cloudinary cors');
  console.log('2. Configurar variables de Cloudinary en el código');
  console.log('3. Asegurarse de que el puerto 3000 esté disponible');
});
