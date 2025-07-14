import apiClient from '../plugins/axios.js';

export async function getData(url) {
    try {
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.log('Error en la petición GET:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export async function postData(url, data) {
    try {
        const config = {};
        
        // Si los datos son FormData, no establecer Content-Type para que axios lo maneje automáticamente
        if (data instanceof FormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data'
            };
        }
        
        const response = await apiClient.post(url, data, config);
        return response.data;
    } catch (error) {
        console.log('Error en la petición POST:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export async function putData(url, data) {
    try {
        const response = await apiClient.put(url, data);
        return response.data;
    } catch (error) {
        console.log('Error en la petición PUT:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export async function deleteData(url) {
    try {
        const response = await apiClient.delete(url);
        return response.data;
    } catch (error) {
        console.log('Error en la petición DELETE:', error.response ? error.response.data : error.message);
        throw error;
    }
}