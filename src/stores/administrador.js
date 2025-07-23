import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient from "../plugins/axios.js";

export const useAdministradorStore = defineStore("auth", () => {
    
    const token = ref("");
    const refreshToken = ref("");
    const user = ref(null);
    const isLoading = ref(false);
    const inactivityTimer = ref(null);
    const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hora en milisegundos

    // Computed para verificar si está autenticado
    const isAuthenticated = computed(() => !!token.value);

    // Función para inicializar el estado desde sessionStorage
    function initializeAuth() {
        const authData = sessionStorage.getItem("Auth");
        if (authData) {
            try {
                const parsedData = JSON.parse(authData);
                const loginTime = parsedData.loginTime;
                const currentTime = Date.now();
                
                // Verificar si han pasado más de 1 hora desde el login
                if (currentTime - loginTime > INACTIVITY_TIMEOUT) {
                    clearAuth();
                    return;
                }
                
                token.value = parsedData.token || "";
                refreshToken.value = parsedData.refresh_token || "";
                user.value = parsedData.user || null;
                
                // Reiniciar timer de inactividad
                startInactivityTimer();
            } catch (error) {
                console.error("Error al parsear datos de auth:", error);
                clearAuth();
            }
        }
    }

    // Función para hacer login con usuario único
    async function login(email, password) {
        isLoading.value = true;
        
        // Credenciales del único usuario autorizado
        const ADMIN_EMAIL = "admin@example.com";
        const ADMIN_PASSWORD = "123456";
        
        return new Promise((resolve) => {
            // Simular una pequeña demora para mostrar el loading
            setTimeout(() => {
                if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                    // Crear tokens y datos del usuario
                    const adminToken = `admin_token_${Date.now()}`;
                    const adminRefreshToken = `refresh_admin_${Date.now()}`;
                    const adminUser = {
                        id: 1,
                        name: "Administrador",
                        email: ADMIN_EMAIL,
                        role: "admin"
                    };

                    setTokens(adminToken, adminRefreshToken, adminUser);
                    startInactivityTimer();
                    
                    resolve({ success: true, message: "Login exitoso" });
                } else {
                    resolve({ 
                        success: false, 
                        message: "Credenciales incorrectas. Solo el administrador puede acceder." 
                    });
                }
                isLoading.value = false;
            }, 1500); // 1.5 segundos de loading para mejor UX
        });
    }

    function setTokens(accessToken, RefreshToken, userData = null) {
        if (accessToken && RefreshToken) {
            token.value = accessToken;
            refreshToken.value = RefreshToken;
            user.value = userData;

            updateLocalStorage();
        } else {
            console.log("⚠️ No se recibió access_token o refresh_token");
        }
    }

    function updateLocalStorage() {
        sessionStorage.setItem(
            "Auth",
            JSON.stringify({
                token: token.value,
                refresh_token: refreshToken.value,
                user: user.value,
                loginTime: Date.now() // Guardar tiempo de login
            })
        );
    }

    function clearAuth() {
        token.value = "";
        refreshToken.value = "";
        user.value = null;
        clearInactivityTimer();
        sessionStorage.removeItem("Auth");
    }

    function logout() {
        clearAuth();
    }

    // Funciones para manejar timer de inactividad
    function startInactivityTimer() {
        clearInactivityTimer();
        inactivityTimer.value = setTimeout(() => {
            console.log("Sesión expirada por inactividad");
            logout();
            // Redirigir a login si es necesario
            if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
                window.location.href = '/signin';
            }
        }, INACTIVITY_TIMEOUT);
    }

    function clearInactivityTimer() {
        if (inactivityTimer.value) {
            clearTimeout(inactivityTimer.value);
            inactivityTimer.value = null;
        }
    }

    function resetInactivityTimer() {
        if (isAuthenticated.value) {
            startInactivityTimer();
        }
    }

    // Función simplificada para mantener la sesión
    function refreshAccessToken() {
        // Para un sistema local, simplemente verificamos si el usuario sigue autenticado
        if (isAuthenticated.value) {
            // Generar nuevo token local
            const newToken = `admin_token_${Date.now()}`;
            token.value = newToken;
            updateLocalStorage();
            return Promise.resolve(newToken);
        } else {
            clearAuth();
            return Promise.reject(new Error('No hay sesión activa'));
        }
    }

    return {
        // State
        token,
        refreshToken,
        user,
        isLoading,
        
        // Getters
        isAuthenticated,
        
        // Actions
        initializeAuth,
        login,
        setTokens,
        clearAuth,
        logout,
        refreshAccessToken,
        resetInactivityTimer
    };
});