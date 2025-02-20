// src/services/authService.js
import axios from 'axios';

export const login = async (cedula, password) => {
    try {
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            cedula,
            password
        });
        return response.data;  // La respuesta debe incluir el token si es exitoso
    } catch (error) {
        return { success: false, message: error.message };
    }
};
