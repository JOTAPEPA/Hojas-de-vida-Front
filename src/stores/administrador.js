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

    // Función para hacer login
    async function login(email, password) {
        isLoading.value = true;
        try {
            // Aquí puedes usar tu endpoint real de login
            const response = await apiClient.post('/auth/login', {
                email,
                password
            });

            const { token: accessToken, refresh_token, user: userData } = response.data;
            
            if (accessToken && refresh_token) {
                setTokens(accessToken, refresh_token, userData);
                startInactivityTimer(); // Iniciar timer después del login
                return { success: true, message: "Login exitoso" };
            } else {
                throw new Error("Respuesta de login inválida");
            }
        } catch (error) {
            console.error("Error en login:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || "Error al iniciar sesión" 
            };
        } finally {
            isLoading.value = false;
        }
    }

    // Función alternativa para login con usuario específico (sin API)
    function loginSpecificUser(email, password) {
        isLoading.value = true;
        
        // Credenciales del usuario específico
        const validEmail = "admin@example.com";
        const validPassword = "123456";

        return new Promise((resolve) => {
            setTimeout(() => {
                if (email === validEmail && password === validPassword) {
                    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token";
                    const mockRefreshToken = "refresh_token_mock";
                    const mockUser = {
                        id: 1,
                        name: "Administrador",
                        email: validEmail,
                        role: "admin"
                    };

                    setTokens(mockToken, mockRefreshToken, mockUser);
                    startInactivityTimer(); // Iniciar timer después del login
                    resolve({ success: true, message: "Login exitoso" });
                } else {
                    resolve({ 
                        success: false, 
                        message: "Credenciales incorrectas" 
                    });
                }
                isLoading.value = false;
            }, 1000); // Simular delay de red
        });
    }

    // Función para obtener datos del usuario desde la API
    async function fetchUserData() {
        try {
            const response = await apiClient.get('/auth/profile');
            user.value = response.data;
            updateLocalStorage();
            return response.data;
        } catch (error) {
            console.error("Error al obtener datos del usuario:", error);
            throw error;
        }
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

    // Función para refrescar el token
    async function refreshAccessToken() {
        try {
            const response = await apiClient.post('/auth/refresh', {
                refresh_token: refreshToken.value
            });
            
            const { token: newToken } = response.data;
            token.value = newToken;
            updateLocalStorage();
            
            return newToken;
        } catch (error) {
            console.error("Error al refrescar token:", error);
            clearAuth();
            throw error;
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
        loginSpecificUser,
        fetchUserData,
        setTokens,
        clearAuth,
        logout,
        refreshAccessToken,
        resetInactivityTimer
    };
});