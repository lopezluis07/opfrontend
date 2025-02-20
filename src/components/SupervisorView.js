import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { getRegistros, getUsuarios, getActividades, getSecciones } from '../services/api';
import NavigationBar from './Navbar';
import EditDeleteModal from './EditDeleteModal';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/styles/SupervisorView.css';

const SupervisorView = () => {
  const [registros, setRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [mostrarSoloHoy, setMostrarSoloHoy] = useState(true);

  useEffect(() => {
    fetchData();
    fetchUsuarios();
    fetchActividades();  
    fetchSecciones();
  }, []);

  const fetchData = async () => {
    try {
      const registrosData = await getRegistros();
      setRegistros(registrosData);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  // Efecto para recarga automática de datos cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000); // Recarga cada 5 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);


  const fetchUsuarios = async () => {
    try {
      const usuariosData = await getUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const fetchActividades = async () => {
    try {
      const actividadesData = await getActividades();
      setActividades(actividadesData);
    } catch (error) {
      console.error('Error al obtener actividades:', error);
    }
  };

  const fetchSecciones = async () => {
    try {
      const seccionesData = await getSecciones();
      setSecciones(seccionesData);
    } catch (error) {
      console.error('Error al obtener secciones:', error);
    }
  };

  const handleEditClick = (registro) => {
    setSelectedRegistro(registro);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      toast.success("Registro actualizado exitosamente");
      setShowEditModal(false);
      fetchData(); // Refresca los datos
    } catch (error) {
      console.error("Error al actualizar el registro:", error);
      toast.error("Error al actualizar el registro");
    }
  };


  // Filtro para registros del día actual
  const obtenerRegistrosFiltrados = () => {
    const registrosOrdenados = [...registros].sort((a, b) =>
      new Date(b.fecha) - new Date(a.fecha)
    );

    if (mostrarSoloHoy) {
      const hoy = moment().format('YYYY-MM-DD');
      const registrosHoy = registrosOrdenados.filter(
        (registro) => moment(registro.fecha).format('YYYY-MM-DD') === hoy
      );
      return registrosHoy;
    }
    return registrosOrdenados;
  };

  const alternarVista = () => {
    setMostrarSoloHoy((prev) => !prev);
  };


  return (
    <div>
      <NavigationBar />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h2 style={{ textAlign: 'center', marginBottom: '1rem', }} >Mis Registros</h2>

      {/* Botón para alternar entre registros de hoy y todos los registros */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <Button onClick={alternarVista}>
          {mostrarSoloHoy ? 'Ver Todos los Registros' : 'Ver Registros de Hoy'}
        </Button>
      </div>


      <div className="card-container">

        {obtenerRegistrosFiltrados().map((registro) => (
          <div key={registro.id} className="card">
            <p className="card-title">Fecha: {moment(registro.fecha).format('YYYY-MM-DD')}</p>
            <p className="card-detail"><strong>Operario:</strong> {registro.Usuario ? `${registro.Usuario.nombre} ${registro.Usuario.apellido}` : ''}</p>
            <p className="card-detail"><strong>Actividad:</strong> {registro.Actividad ? registro.Actividad.nombre : ''}</p>
            <p className="card-detail"><strong>Supervisor:</strong> {registro.Supervisor ? `${registro.Supervisor.nombre} ${registro.Supervisor.apellido}` : ''}</p>

            <Button className="card-button" onClick={() => handleEditClick(registro)}>
              Editar
            </Button>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      <EditDeleteModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        registro={selectedRegistro} 
        onSave={handleSave}
        usuarios={usuarios}
        actividades={actividades}
        secciones={secciones}
      />
    </div>
  );
};

export default SupervisorView;
