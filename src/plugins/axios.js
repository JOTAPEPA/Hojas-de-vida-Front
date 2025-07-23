import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://hojas-de-vida-back.onrender.com/api',
    timeout: 30000, // 30 segundos para manejar cold starts de Render
})

apiClient.interceptors.request.use(
    (config) => {
        const dataStore = JSON.parse(localStorage.getItem('Auth') || '{}');
        const token = dataStore?.token || "";
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Solo establecer Content-Type si no es FormData
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

// Interceptor para manejar respuestas y tokens expirados
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const dataStore = JSON.parse(localStorage.getItem('Auth') || '{}');
                const refreshToken = dataStore?.refresh_token;

                if (refreshToken) {
                    const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
                        refresh_token: refreshToken
                    });

                    const { token: newToken } = response.data;
                    
                    // Actualizar token en localStorage
                    const updatedAuth = {
                        ...dataStore,
                        token: newToken
                    };
                    localStorage.setItem('Auth', JSON.stringify(updatedAuth));

                    // Actualizar header de autorización
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Si el refresh falla, limpiar auth y redirigir al login
                localStorage.removeItem('Auth');
                window.location.href = '/signin';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;