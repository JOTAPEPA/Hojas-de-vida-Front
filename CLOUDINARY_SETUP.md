# Configuración del Servidor Backend para Cloudinary

## 📋 Pasos para configurar el servidor

### 1. Crear cuenta en Cloudinary
1. Ve a [https://cloudinary.com](https://cloudinary.com)
2. Crea una cuenta gratuita
3. En el Dashboard, encontrarás tus credenciales:
   - **Cloud Name**
   - **API Key** 
   - **API Secret**

### 2. Configurar el servidor
1. Copia `server-example.js` a una nueva carpeta para tu backend
2. Copia `server-package.json` y renómbralo a `package.json`
3. Abre `server-example.js` y reemplaza las siguientes líneas:

```javascript
cloudinary.config({
  cloud_name: 'TU_CLOUD_NAME',      // ← Reemplaza con tu Cloud Name
  api_key: 'TU_API_KEY',            // ← Reemplaza con tu API Key
  api_secret: 'TU_API_SECRET'       // ← Reemplaza con tu API Secret
});
```

### 3. Instalar dependencias
Abre una terminal en la carpeta del servidor y ejecuta:

```bash
npm install
```

### 4. Ejecutar el servidor
```bash
npm start
```

O para desarrollo con auto-recarga:
```bash
npm run dev
```

### 5. Verificar funcionamiento
- El servidor debería ejecutarse en `http://localhost:3000`
- Puedes probar el endpoint visitando: `http://localhost:3000/test`
- Deberías ver un mensaje JSON confirmando que el servidor funciona

## 🔧 Solución de problemas

### Error: "Respuesta inválida del servidor"
- ✅ Verifica que el servidor esté ejecutándose en el puerto 3000
- ✅ Confirma que las credenciales de Cloudinary sean correctas
- ✅ Revisa la consola del servidor para errores

### Error: "CORS policy"
- ✅ Asegúrate de que tu aplicación Vue esté en `http://localhost:5173`
- ✅ Si usas un puerto diferente, actualiza la configuración CORS en el servidor

### Error: "Tipo de archivo no permitido"
- ✅ Solo se permiten: JPG, PNG, GIF, PDF, DOC, DOCX
- ✅ Tamaño máximo: 10MB por archivo

## 📁 Estructura de archivos recomendada

```
proyecto/
├── frontend/ (tu proyecto Vue actual)
│   ├── src/
│   ├── package.json
│   └── ...
└── backend/
    ├── server-example.js
    ├── package.json (copiado de server-package.json)
    └── README.md (este archivo)
```

## 🚀 Funcionalidades del servidor

- ✅ Upload de archivos a Cloudinary
- ✅ Validación de tipos de archivo
- ✅ Límite de tamaño (10MB)
- ✅ Manejo de errores detallado
- ✅ Eliminación de archivos (opcional)
- ✅ Respuestas JSON estructuradas

## 📱 Testing

Una vez que el servidor esté funcionando, puedes probar la funcionalidad:

1. Abre tu aplicación Vue en `http://localhost:5173`
2. Ve a la sección de empleados
3. Haz clic en "Nuevo Empleado"
4. En la pestaña "Documentos", usa los componentes de upload
5. Selecciona un archivo y verifica que se suba correctamente

## 🔗 URLs importantes

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Test endpoint**: http://localhost:3000/test
- **Upload endpoint**: http://localhost:3000/upload
- **Cloudinary Dashboard**: https://console.cloudinary.com
