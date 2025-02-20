// src/components/Navbar.js
import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/Navbar.css';

const NavigationBar = () => {
  const { logout } = useAuth();
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');

  return (
    <Navbar className="custom-navbar" expand="lg">
      <Container>

        <LinkContainer to="/registro-operario">
          <Navbar.Brand>Control Operativo</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">

          <Nav className="me-auto">
            {role === 'Admin' && (
              <React.Fragment>

                <LinkContainer to="/dashboard">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>


                <LinkContainer to="/usuarios">
                  <Nav.Link>Usuarios</Nav.Link>
                </LinkContainer>

                <LinkContainer to="/actividades">
                  <Nav.Link>Actividades</Nav.Link> 
                </LinkContainer>

                <LinkContainer to="/database">
                  <Nav.Link>Registros Operarios</Nav.Link>
                </LinkContainer>

                <LinkContainer to="/conductor">
                  <Nav.Link>Registro Conductores</Nav.Link>
                </LinkContainer>

              </React.Fragment>
            )}
            {role === 'Supervisor' && (
              <React.Fragment>

                <LinkContainer to="/supervisor">
                  <Nav.Link>Mis Registros</Nav.Link>
                </LinkContainer>

                <LinkContainer to="/conductor">
                  <Nav.Link>Registro Conductores</Nav.Link>
                </LinkContainer>

              </React.Fragment>
            )}


          </Nav>
          <Nav className="ms-auto">
            {userName ? (
              <React.Fragment>
                <span className="navbar-text">Bienvenido(a), {userName}</span>
                <Nav.Link onClick={logout}>Cerrar Sesión</Nav.Link>
              </React.Fragment>
            ) : (
              <LinkContainer to="/login">
                <Nav.Link>Cerrar Sesión</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
