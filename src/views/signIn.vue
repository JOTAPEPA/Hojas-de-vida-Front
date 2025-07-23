<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-image">
                <div class="image-overlay">
                    <h2>Bienvenido de vuelta</h2>
                    <p>Inicia sesión para acceder a tu cuenta</p>
                </div>
            </div>
            <div class="login-form">
                <div class="form-header">
                    <h1>Iniciar Sesión</h1>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>
                <form @submit.prevent="handleSubmit" class="form-content">
                    <!-- Mensaje de error -->
                    <div v-if="errorMessage" class="error-message">
                        {{ errorMessage }}
                    </div>
                    
                    <!-- Mensaje informativo para el usuario único -->
                    <div class="info-message">
                        <p><strong>Acceso de Administrador:</strong></p>
                        <p>Email: admin@example.com</p>
                        <p>Contraseña: 123456</p>
                        <p><small>* Solo el administrador puede acceder al sistema</small></p>
                    </div>

                    <div class="form-group">
                        <label for="email">Correo Electrónico</label>
                        <input 
                            type="email" 
                            id="email" 
                            v-model="email"
                            placeholder="admin@example.com" 
                            required
                            :disabled="authStore.isLoading"
                        >
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <div class="password-input-container">
                            <input 
                                :type="showPassword ? 'text' : 'password'"
                                id="password" 
                                v-model="password"
                                placeholder="••••••••" 
                                required
                                :disabled="authStore.isLoading"
                            >
                            <button 
                                type="button" 
                                class="password-toggle"
                                @click="togglePasswordVisibility"
                                :disabled="authStore.isLoading"
                            >
                                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                            </button>
                        </div>
                    </div>
                    <div class="form-options">
                        <div class="remember-me">
                            <input type="checkbox" id="remember">
                            <label for="remember">Recordarme</label>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        class="login-button"
                        :disabled="authStore.isLoading"
                    >
                        <div v-if="authStore.isLoading" class="loading-container">
                            <div class="spinner"></div>
                            <span>Iniciando sesión...</span>
                        </div>
                        <span v-else>Iniciar Sesión</span>
                    </button>
                  
                </form>
            </div>
        </div>
        
        <!-- Overlay de loading global -->
        <div v-if="authStore.isLoading" class="loading-overlay">
            <div class="loading-content">
                <div class="large-spinner"></div>
                <p>Verificando credenciales...</p>
                <small>Validando acceso de administrador</small>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAdministradorStore } from '../stores/administrador.js';
import { useRouter } from 'vue-router'; 


const router = useRouter();
const authStore = useAdministradorStore();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const showPassword = ref(false);


const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};

// Inicializar el store
onMounted(() => {
    authStore.initializeAuth();
    // Si ya está autenticado, redirigir
    if (authStore.isAuthenticated) {
        router.push('/');
    }
});

const handleSubmit = async () => {
    errorMessage.value = '';
    
    if (!email.value || !password.value) {
        errorMessage.value = 'Por favor, completa todos los campos';
        return;
    }

    try {
        // Usar la función de login simplificada
        const result = await authStore.login(email.value, password.value);
        
        if (result.success) {
            // Redirigir al dashboard o home directamente
            router.push('/');
        } else {
            errorMessage.value = result.message;
        }
    } catch (error) {
        errorMessage.value = 'Error inesperado. Inténtalo de nuevo.';
        console.error('Error en login:', error);
    }
};


</script>

<style scoped>
/* Estilos base y reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Contenedor principal */
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    background-color: #f5f7fa;
    padding: 20px;
}

/* Tarjeta de login */
.login-card {
    display: flex;
    width: 100%;
    max-width: 1000px;
    height: 600px;
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* Sección de la imagen */
.login-image {
    width: 45%;
    background-image: url('https://img.freepik.com/fotos-premium/alegre-familia-medio-oriente-divirtiendose-posando-sobre-fondo-azul_116547-21998.jpg');
    background-size: cover;
    background-position: center;
    position: relative;
}

.image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 30px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    color: white;
}

.image-overlay h2 {
    font-size: 28px;
    margin-bottom: 10px;
}

.image-overlay p {
    font-size: 16px;
    opacity: 0.9;
}

/* Sección del formulario */
.login-form {
    width: 55%;
    padding: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.form-header {
    margin-bottom: 40px;
    text-align: center;
}

.form-header h1 {
    font-size: 28px;
    color: #2c3e50;
    margin-bottom: 10px;
}

.form-header p {
    color: #7f8c8d;
    font-size: 14px;
}

/* Grupos de formulario */
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #2c3e50;
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.form-group input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group input:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.6;
}

/* Contenedor de input de contraseña */
.password-input-container {
    position: relative;
}

.password-input-container input {
    padding-right: 45px;
}

.password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 5px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.password-toggle:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.05);
}

.password-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

/* Mensajes de error e información */
.error-message {
    background-color: #fee;
    border: 1px solid #fcc;
    color: #c33;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
    text-align: center;
}

.info-message {
    background-color: #e3f2fd;
    border: 1px solid #bbdefb;
    color: #1976d2;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 13px;
}

.info-message p {
    margin: 2px 0;
}

.info-message strong {
    color: #0d47a1;
}

/* Opciones del formulario */
.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    font-size: 13px;
}

.remember-me {
    display: flex;
    align-items: center;
}

.remember-me input {
    margin-right: 8px;
}

.forgot-password {
    color: #3498db;
    text-decoration: none;
    transition: color 0.3s;
}

.forgot-password:hover {
    color: #2980b9;
    text-decoration: underline;
}

/* Botón de login */
.login-button {
    width: 100%;
    padding: 14px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-bottom: 20px;
    position: relative;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-button:hover:not(:disabled) {
    background-color: #2980b9;
}

.login-button:disabled {
    background-color: #7fb3d3;
    cursor: not-allowed;
}

.login-button:disabled:hover {
    background-color: #7fb3d3;
}

/* Contenedor de loading */
.loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

/* Spinner de carga */
.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-left: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Overlay de loading global */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(2px);
}

.loading-content {
    background: white;
    padding: 40px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    max-width: 300px;
    width: 90%;
}

.loading-content p {
    margin: 20px 0 10px 0;
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
}

.loading-content small {
    color: #7f8c8d;
    font-size: 14px;
    line-height: 1.4;
}

.large-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e3f2fd;
    border-left: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

/* Enlace de registro */
.signup-link {
    text-align: center;
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 30px;
}

.signup-link a {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
}

.signup-link a:hover {
    text-decoration: underline;
}

/* Login con redes sociales */
.social-login {
    text-align: center;
}

.social-login p {
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 15px;
    position: relative;
}

.social-login p::before,
.social-login p::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 30%;
    height: 1px;
    background-color: #ddd;
}

.social-login p::before {
    left: 0;
}

.social-login p::after {
    right: 0;
}

.social-icons {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.social-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s, box-shadow 0.3s;
}

.social-icon svg {
    fill: white;
    width: 18px;
    height: 18px;
}

.social-icon.google {
    background-color: #db4437;
}

.social-icon.facebook {
    background-color: #4267b2;
}

.social-icon.twitter {
    background-color: #1da1f2;
}

.social-icon:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
    .login-card {
        flex-direction: column;
        height: auto;
    }
    
    .login-image, .login-form {
        width: 100%;
    }
    
    .login-image {
        height: 200px;
    }
    
    .login-form {
        padding: 30px;
    }
    
    .loading-content {
        margin: 20px;
        padding: 30px 25px;
    }
}
</style>