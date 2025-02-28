// src/components/LoginForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Asegúrate de tener instalada esta dependencia
import '../assets/styles/LoginForm.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm = () => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
 
    try {
      // Realizar solicitud al backend para autenticar el usuario
      const response = await axios.post('http://35.170.228.44:3001/api/login', {
        identificador: cedula,
        password,
      });
      // Verificación del token recibido
      const token = response.data.token;
      if (!token) {
        throw new Error('Token no recibido');
      }

      // Almacenar el token según la preferencia del usuario
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      // Decodificar el token para obtener información del usuario
      const decodedToken = jwtDecode(token);

      const userRole = decodedToken.role;
      const userName = decodedToken.name || 'Usuario';

      // Guardar información del usuario en localStorage
      localStorage.setItem('role', userRole);
      localStorage.setItem('user', JSON.stringify({ name: userName, role: userRole }));

      // Redirigir al usuario según su rol
      if (userRole === 'Admin') {
        navigate('/database');
      } else if (userRole === 'Supervisor') {
        navigate('/registro-operario');
      } else if (userRole === 'Conductor') {
        navigate('/registro_conductores');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Credenciales incorrectas o error en el servidor');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Iniciar Sesión</h2>
        <input
          type="text"
          placeholder="Cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          required
        />
 
        <div className="password-container">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="remember-me-container">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          <label htmlFor="rememberMe">Mantener sesión activa</label>
        </div>

        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default LoginForm;
