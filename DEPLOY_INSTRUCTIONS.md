# Instrucciones de Despliegue Frontend

## Configuración Actual

El proyecto está configurado para desplegarse en Render como un **Static Site** o **Web Service**.

### Archivos importantes para el despliegue:

- `render.yaml` - Configuración para Static Site
- `render-web-service.yaml` - Configuración alternativa para Web Service
- `public/_redirects` - Maneja las rutas SPA para Vue Router
- `.env.production` - Variables de entorno para producción

## Opción 1: Static Site (Recomendado)

1. En tu dashboard de Render, crea un nuevo **Static Site**
2. Conecta tu repositorio GitHub: `JOTAPEPA/Hojas-de-vida-Front`
3. Configuración:
   - **Root Directory**: `.` (o déjalo vacío)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### Variables de Entorno para Static Site:
```
VITE_API_BASE_URL=https://hojas-de-vida-back.onrender.com/api
```

## Opción 2: Web Service

1. En tu dashboard de Render, crea un nuevo **Web Service**
2. Conecta tu repositorio GitHub: `JOTAPEPA/Hojas-de-vida-Front`
3. Configuración:
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `VITE_API_BASE_URL=https://hojas-de-vida-back.onrender.com/api`

## Variables de Entorno

Asegúrate de configurar estas variables en Render:

```
VITE_API_BASE_URL=https://hojas-de-vida-back.onrender.com/api
```

## URL del Backend

Tu backend está funcionando correctamente en:
- `https://hojas-de-vida-back.onrender.com/api`

## Notas Importantes

- El archivo `_redirects` maneja las rutas SPA para que Vue Router funcione correctamente
- La aplicación se construye usando Vite y se optimiza para producción
- Las llamadas a la API están configuradas para usar el interceptor de Axios con manejo de tokens

## Verificación

Una vez desplegado, tu frontend debería estar disponible en una URL como:
- `https://tu-app-frontend.onrender.com`

Y debería comunicarse correctamente con tu backend en:
- `https://hojas-de-vida-back.onrender.com/api`

## Solución de Problemas

### Error "vite: not found"
Si obtienes el error `sh: 1: vite: not found`, significa que las dependencias de build no están disponibles. 

**Solución aplicada**: Movimos Vite y otras dependencias de build a `dependencies` en lugar de `devDependencies` para que estén disponibles en el entorno de producción.

### Error de vulnerabilidades
Si aparecen vulnerabilidades durante `npm install`, puedes ignorarlas durante el despliegue ya que no afectan la funcionalidad.

### Error de conexión con la API
Verifica que la variable de entorno `VITE_API_BASE_URL` esté configurada correctamente en Render.
