import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Home from './pages/Home';
import RegistroOperario from './pages/RegistroOperario';
import NotFound from './pages/NotFound';
import Login from './pages/LoginPage';  // Este es tu componente de Login
import ProtectedRoute from './components/ProtectedRoute';  // La ruta protegida

const Routes = () => (
  <Routes>
      <Route exact path="/login" component={Login} />  {/* Página de Login */}
      <ProtectedRoute path="/registro-operario" component={RegistroOperario} />  {/* Ruta protegida */}
      <Route exact path="/" render={() => <Redirect to="/login" />} /> {/* Redirigir a login si no está autenticado */}
      <Route component={NotFound} />  {/* Ruta 404 */}
  </Routes>
);

export default Routes;  