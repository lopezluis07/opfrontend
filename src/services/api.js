// src/services/api.js

import axios from 'axios';
import { toast } from 'react-toastify';

// Definir la URL base de la API
const BASE_URL = 'http://35.170.228.44:3001/api';

// Crear una instancia de Axios con la URL base
const api = axios.create({    
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores y notificaciones
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || 'Ocurrió un error en la solicitud';
    toast.error(`Error: ${errorMessage}`);
    return Promise.reject(error);
  }
);

// Función de utilidad para ordenar por nombre
const sortByName = (data) => data.sort((a, b) => a.nombre.localeCompare(b.nombre));

// Función para formatear datos de registro antes de enviar
const formatRegistroData = (data) => ({
  ...data,
  usuario_id: Number(data.usuario_id),
  actividad_id: Number(data.actividad_id),
  seccion_id: Number(data.seccion_id),
  fecha: new Date(data.fecha).toISOString(),
});

// ===================
// FUNCIONES DE LOGIN
// ===================

export const login = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

// ==============================
// FUNCIONES DE USUARIOS
// ==============================

export const getUsuarios = async () => {
  try {
    const response = await api.get('/usuarios');
    return response.data;
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    throw error;
  }
};

export const createUsuario = async (usuario) => {
  try {
    const response = await api.post('/usuarios', usuario);
    return response.data;
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    throw error;
  }
};

export const deleteUsuario = async (id) => {
  try {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error;
  }
};

export const updateUsuario = async (id, usuario) => {
  try {
    const response = await api.put(`/usuarios/${id}`, usuario);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    throw error;
  }
};

// ==============================
// FUNCIONES DE REGISTROS
// ==============================

export const getRegistros = async () => {
  try {
    const response = await api.get('/registros-operarios');
    return response.data;
  } catch (error) {
    console.error('Error al obtener registros:', error);
    throw error;
  }
};

export const createRegistroOperario = async (data) => {
  try {
    const response = await api.post('/registros-operarios', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear registro operario:', error);
    throw error;
  }
};

export const updateRegistro = async (id, data) => {
  try {
    const formattedData = formatRegistroData(data);
    const response = await api.put(`/registros-operarios/${id}`, formattedData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el registro en la API:", error.response?.data || error.message || 'Error desconocido');
    throw error;
  }
};

export const deleteRegistro = async (id) => {
  try {
    const response = await api.delete(`/registros-operarios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    throw error;
  }
};

// ==============================
// FUNCIONES DE ACTIVIDADES
// ==============================

export const getActividades = async () => {
  try {
    const response = await api.get('/actividades');
    return sortByName(response.data);
  } catch (error) {
    console.error('Error en getActividades:', error);
    return [];
  }
};

export const getSubactividades = async (actividadId) => {
  try {
    const response = await api.get(`/subactividades/actividad/${actividadId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener subactividades:", error);
    return [];
  }
};

// ==============================
// FUNCIONES DE SECCIONES Y LOTES
// ==============================

export const getSecciones = async () => {
  try {
    const response = await api.get('/secciones');
    return sortByName(response.data);
  } catch (error) {
    console.error('Error en getSecciones:', error);
    return [];
  }
};

export const getLotes = async (seccionId) => {
  try {
    const response = await api.get(`/lotes/seccion/${seccionId}`);
    return sortByName(response.data);
  } catch (error) {
    console.error('Error en getLotes:', error);
    return [];
  }
};

// ==============================
// FUNCIONES DE GRUPOS
// ==============================

export const getGrupos = async () => {
  try {
    const response = await api.get('/grupos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    throw error;
  }
};

export const createGrupo = async (data) => {
  try {
    const response = await api.post('/grupos', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear el grupo:', error);
    throw error;
  }
};

export const duplicateGrupo = async (id) => {
  try {
    const response = await api.post(`/grupos/${id}/duplicar`);
    return response.data;
  } catch (error) {
    console.error('Error al duplicar el grupo:', error);
    throw error;
  }
};

export const updateGrupo = async (id, data) => {
  try {
    const response = await api.put(`/grupos/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el grupo:', error);
    throw error;
  }
};

export const deleteGrupo = async (id) => {
  try {
    const response = await api.delete(`/grupos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el grupo:', error);
    throw error;
  }
};

// ==============================
// FUNCIONES ADICIONALES
// ==============================

export const getRegistrosPorOperarioFecha = async (operario_id, fecha) => {
  try {
    const response = await api.get('/registros', { params: { operario_id, fecha } });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo registros por operario y fecha:', error);
    return [];
  }
};

export const calcularHorasLabor = async (data) => {
  try {
    if (!data.horaInicio || !data.horaFin) {
      throw new Error("Los campos 'horaInicio' y 'horaFin' son obligatorios.");
    }
    if (isNaN(data.actividad_id)) {
      throw new Error("El 'actividad_id' debe ser un número válido.");
    }

    const formattedData = {
      hora_inicio: data.horaInicio,
      hora_fin: data.horaFin,
      horasLluvia: data.horasLluvia || "0",
      horasTraslado: data.horasTraslado || "0",
      horasRecoleccion: data.horasRecoleccion || "0",
      actividad_id: data.actividad_id,
      descuentoManana: data.descuentoManana || false,
      descuentoTarde: data.descuentoTarde || false,
    };

    const response = await api.post("/calcular-horas-labor", formattedData);
    return response.data.horas_labor;
  } catch (error) {
    console.error("Error al calcular las horas laborables:", error.response?.data || error.message);
    throw error;
  }
};
