import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegistroForm from './components/RegistroForm';
import Database from './components/Database';
import Usuarios from './components/Usuarios';
import Actividades from './components/Actividades';
import Dashboard from './components/Dashboard';
import NoAutorizado from './components/NoAutorizado';
import SupervisorView from './components/SupervisorView';
import DriverForm from './components/DriverForm';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <div style={{ minHeight: 'calc(100vh - 50px)', display: 'flex', flexDirection: 'column' }}>
            <Routes>
              {/* Ruta para el login */}
              <Route path="/login" element={<LoginForm />} />

              {/* Rutas protegidas para diferentes roles */}
              <Route
                path="/registro-operario"
                element={
                  <ProtectedRoute requiredRole="Supervisor">
                    <RegistroForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/database"
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <Database />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <Usuarios />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/actividades"
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <Actividades />
                  </ProtectedRoute>
                }
              />


              {/* Nueva Ruta para Supervisores */}
              <Route
                path="/supervisor"
                element={
                  <ProtectedRoute requiredRole="Supervisor">
                    <SupervisorView />
                  </ProtectedRoute>
                }
              />

              {/* Nueva Ruta para el Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Nueva Ruta para Conductores */}
              <Route
                path="/conductor"
                element={
                  <ProtectedRoute requiredRole="Conductor">
                    <DriverForm />
                  </ProtectedRoute>
                }
              />



              {/* Ruta para no autorizado */}
              <Route path="/no-autorizado" element={<NoAutorizado />} />

              {/* Ruta por defecto: Redirige a dashboard según el rol del usuario */}
              <Route
                path="*"
                element={<DefaultRedirect />}
              />
            </Routes>
          </div>
          <Footer />
        </Router>
      </AuthProvider>
    </div>
  );
}

// Componente de redirección según el rol del usuario
const DefaultRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || !role) {
    return <Navigate to="/login" />;
  }

  switch (role) {
    case 'Admin':
      return <Navigate to="/dashboard" />;
    case 'Supervisor':
      return <Navigate to="/supervisor" />;
    case 'Conductor':
      return <Navigate to="/conductor" />;
    default:
      return <Navigate to="/no-autorizado" />;
  }
};

export default App;
