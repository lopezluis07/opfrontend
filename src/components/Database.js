import React, { useState, useEffect } from "react";
import { Button, DatePicker } from "antd";
import moment from "moment";
import { getRegistros, getUsuarios, getActividades, getSecciones, getSubactividades, } from "../services/api";
import NavigationBar from "./Navbar";
import EditDeleteModal from "./EditDeleteModal";
import ExportToExcel from "./ExportToExcel";
import TableComponent from "./TableComponent";
import ExportToExcelNew from "./ExportToExcelNew";
import "../assets/styles/DatabaseStyles.css";

const Database = () => {
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [maxSubactividades, setMaxSubactividades] = useState(0);
  const [maxLotes, setMaxLotes] = useState(0);
  const [subactividades, setSubactividades] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    // Llama a la función de filtro cuando cambien las fechas o los registros originales
    const filtered = filterRecordsByDate();
    setFilteredRegistros(filtered);
  }, [startDate, endDate, registros]);



  const fetchData = async () => {
    try {
      const registrosData = await getRegistros();



      // Ordenar los registros por fecha de forma ascendente (asegurando conversión a fecha)
      registrosData.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());


      setRegistros(registrosData);
      setFilteredRegistros(registrosData); // Inicialmente, todos los registros están filtrados

      const maxSubacts = Math.max(
        ...registrosData.map((r) =>
          r.Subactividades ? r.Subactividades.length : 0
        )
      );
      setMaxSubactividades(maxSubacts);

      const maxLts = Math.max(
        ...registrosData.map((r) => (r.Lotes ? r.Lotes.length : 0))
      );
      setMaxLotes(maxLts);

      const usuariosData = await getUsuarios();
      setUsuarios(usuariosData);

      const actividadesData = await getActividades();
      setActividades(actividadesData);

      const seccionesData = await getSecciones();
      setSecciones(seccionesData);

      const subactividadesData = await getSubactividades();
      setSubactividades(subactividadesData);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  // Función para filtrar registros por fecha
  const filterRecordsByDate = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const filteredRecords = registros.filter((registro) => {
      const registroFecha = new Date(registro.fecha);

      // Asegurarse de comparar a nivel de día
      registroFecha.setHours(0, 0, 0, 0);
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);

      const isAfterStartDate = start ? registroFecha >= start : true;
      const isBeforeEndDate = end ? registroFecha <= end : true;

      return isAfterStartDate && isBeforeEndDate;
    });

    return filteredRecords;
  };

  const handleEditClick = (registro) => {
    setSelectedRegistro(registro);
    setShowEditModal(true);
  };

  const handleSave = () => {
    setShowEditModal(false);
    fetchData(); // Actualizar datos después de guardar cambios
  };

  return (
    <div className="database-container">
      <NavigationBar />

      <div className="header">
        <h2 className="title">Registros de los Operarios</h2>

        <div className="filters-actions-container">
          <div className="date-filters">
            <DatePicker
              placeholder="Inicio de Fecha"
              onChange={(date, dateString) => setStartDate(dateString)}
            />
            <DatePicker
              placeholder="Final de Fecha"
              onChange={(date, dateString) => setEndDate(dateString)}
            />
          </div>
          <div className="export-buttons">
            <ExportToExcel
              registros={filteredRegistros} // Enviar registros ya filtrados
              startDate={startDate}
              endDate={endDate}
              maxSubactividades={maxSubactividades}
              maxLotes={maxLotes}
            />
            <ExportToExcelNew
              registros={filteredRegistros} // También puedes enviar registros filtrados o diferentes
              maxSubactividades={maxSubactividades}
              maxLotes={maxLotes}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <TableComponent
          data={filteredRegistros} // Mostrar registros filtrados en la tabla
          onEditClick={handleEditClick}
          maxSubactividades={maxSubactividades}
        // maxLotes={maxLotes}
        />
      </div>

      {showEditModal && (
        <EditDeleteModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          registro={selectedRegistro}
          onSave={handleSave}
          usuarios={usuarios || []}
          actividades={actividades || []}
          secciones={secciones || []}
          subactividades={subactividades || []}
        />
      )}
    </div>
  );
};

export default Database;
