# Sistema de Autenticación

## Configuración Completada

Se ha implementado un sistema completo de autenticación con las siguientes características:

### 🔐 Funcionalidades Implementadas

1. **Login para usuario específico**
   - Email: `admin@example.com`
   - Contraseña: `123456`
   - Almacenamiento de token en localStorage
   - Manejo de estado con Pinia

2. **Protección de rutas**
   - Rutas protegidas requieren autenticación
   - Redirección automática al login si no está autenticado
   - Redirección automática al home si ya está autenticado

3. **Gestión de token**
   - Interceptor de axios para incluir token automáticamente
   - Refresh token automático cuando expira
   - Limpieza automática si el refresh falla

4. **Interfaz de usuario**
   - Login con validación de errores
   - Indicador de carga
   - Botón para mostrar/ocultar contraseña
   - Header con información del usuario
   - Botón de logout

### 🛠️ Archivos Modificados

- `src/stores/administrador.js` - Store de Pinia para autenticación
- `src/views/signIn.vue` - Componente de login
- `src/views/home.vue` - Página principal con info del usuario
- `src/router/routes.js` - Configuración de rutas protegidas
- `src/plugins/axios.js` - Interceptors para token
- `src/services/apiClient.js` - Servicios de API

### 🔄 Dos Modos de Funcionamiento

#### Modo 1: Usuario Específico (Actual)
```javascript
// En signIn.vue, línea actual
const result = await authStore.loginSpecificUser(email.value, password.value);
```

#### Modo 2: API Real
```javascript
// Descomenta esta línea y comenta la anterior
const result = await authStore.login(email.value, password.value);
```

### 📡 Endpoints de API Esperados

Si cambias al Modo 2, tu API debe tener estos endpoints:

```javascript
// Login
POST /auth/login
Body: { email, password }
Response: { token, refresh_token, user }

// Refresh Token
POST /auth/refresh
Body: { refresh_token }
Response: { token }

// Obtener perfil del usuario
GET /auth/profile
Headers: { Authorization: Bearer <token> }
Response: { user data }
```

### 🚀 Cómo Usar

1. **Iniciar sesión:**
   - Ve a `/signin`
   - Usa las credenciales: `admin@example.com` / `123456`

2. **Navegar:**
   - Después del login serás redirigido a `/`
   - Todas las rutas están protegidas excepto `/signin`

3. **Cerrar sesión:**
   - Haz clic en "Cerrar Sesión" en el header
   - Serás redirigido al login

### 🔧 Configuración Adicional

#### Cambiar URL base de la API:
```javascript
// En src/plugins/axios.js
const apiClient = axios.create({
    baseURL: 'https://tu-api.com' // Cambia esta URL
})
```

#### Agregar más datos del usuario:
```javascript
// En src/stores/administrador.js, función loginSpecificUser
const mockUser = {
    id: 1,
    name: "Tu Nombre",
    email: validEmail,
    role: "admin",
    // Agrega más campos aquí
};
```

### 🎨 Personalización

- Los estilos están en cada componente Vue
- Puedes cambiar los colores y diseño modificando el CSS
- El logo y la imagen de fondo se pueden cambiar en `signIn.vue`

### 🔒 Seguridad

- Los tokens se almacenan en localStorage
- Se limpian automáticamente al cerrar sesión
- Los interceptors manejan tokens expirados
- Las rutas están protegidas con guards

### 📱 Responsive

- La interfaz es completamente responsive
- Funciona en dispositivos móviles y desktop
- Los breakpoints están configurados para tablets y móviles
