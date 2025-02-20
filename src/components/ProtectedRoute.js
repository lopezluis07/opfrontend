import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrección en la importación

const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Tiempo actual en segundos
    return decoded.exp && decoded.exp > currentTime; // Valida que el token no esté expirado
  } catch (error) {
    console.error("Error al decodificar el token:", error); // Log para depuración
    return false;
  }
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');


  if (!token || !role || !isTokenValid(token)) {
    console.warn("Token inválido o no encontrado, redirigiendo a /login...");
    return <Navigate to="/login" />;
  }

  // Determinar los roles permitidos
  const allowedRoles = requiredRole
    ? (requiredRole === 'Conductor' && role === 'Supervisor'
        ? ['Conductor', 'Supervisor']
        : [requiredRole, 'Admin'])
    : ['Admin'];


  if (!allowedRoles.includes(role)) {
    console.warn("Rol no permitido, redirigiendo a /login...");
    return <Navigate to="/login" />;
  }

  // Si todo está correcto, renderiza el componente hijo
  return children;
};

export default ProtectedRoute;
