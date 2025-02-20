// src/components/TableComponent.js
import React from "react";
import { Table, Button } from "antd";
import "../assets/styles/TableStyles.css";
import { EditOutlined } from "@ant-design/icons";


const TableComponent = ({ data, onEditClick, maxSubactividades, maxLotes }) => {

  // funcion para formatear el rendimiento 
  const formatRendimiento = (valor) => {
    // Si el valor es un número entero, muestra sin decimales; si tiene decimales, muestra hasta dos.
    return parseFloat(valor) % 1 === 0 ? parseInt(valor, 10) : parseFloat(valor).toFixed(2);
  };

  // Ordenar por fecha de forma DESCENDENTE (más recientes primero)
  const sortedData = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  
  const columns = [
   //  { title: "ID", dataIndex: "id", key: "id" },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', className: 'ant-table-column-fecha' },
    {
      title: "Operario",
      render: (text, record) =>
        `${record.Usuario
          ? `${record.Usuario.nombre} ${record.Usuario.apellido}`
          : "N/A"
        }`,
      key: "operario",
      className: "ant-table-column-operario",
    },

    // { title: "Cédula", dataIndex: ["Usuario", "cedula"], key: "cedula" },
    {
      title: "Actividad",
      dataIndex: ["Actividad", "nombre"],
      key: "actividad",
      className: "ant-table-column-actividad",
    },

    // Columnas dinámicas para subactividades
    ...Array.from({ length: maxSubactividades }, (_, i) => ({
      title: `Subactividad ${i + 1}`,
      key: `subactividad_${i + 1}`,
      render: (text, record) =>
        record.Subactividades && record.Subactividades[i]
          ? record.Subactividades[i].nombre
          : "",
      className: `ant-table-column-subactividad-${i + 1}`,
    })),

    {
      title: "Sección",
      dataIndex: ["Seccion", "nombre"],
      key: "seccion",
      className: "ant-table-column-seccion",
    },

    // Columnas dinámicas para lotes
    ...Array.from({ length: maxLotes }, (_, i) => ({
      title: `Lote ${i + 1}`,
      key: `lote_${i + 1}`,
      render: (text, record) =>
        record.Lotes && record.Lotes[i] ? record.Lotes[i].nombre : "",
      className: `ant-table-column-lote-${i + 1}`,
    })),

    {
      title: "Rendimiento",
      dataIndex: "rendimiento",
      key: "rendimiento",
      className: "ant-table-column-rendimiento",
      render: (value) => formatRendimiento(value),
    },
    
    {
      title: "Unidad de Medida",
      dataIndex: "unidad_medida",
      key: "unidad_medida",
      className: "ant-table-column-unidad-medida",
    },
    {
      title: "Hora Inicio",
      dataIndex: "hora_inicio",
      key: "hora_inicio",
      className: "ant-table-column-hora-inicio",
    },
    {
      title: "Hora Fin",
      dataIndex: "hora_fin",
      key: "hora_fin",
      className: "ant-table-column-hora-fin",
    },
    {
      title: "Horas Labor",
      dataIndex: "horas_labor",
      key: "horas_labor",
      className: "ant-table-column-horas-labor",
    },
    {
      title: "Horas Lluvia",
      dataIndex: "horas_lluvia",
      key: "horas_lluvia",
      className: "ant-table-column-horas-lluvia",
    },
    {
      title: "Horas Traslado",
      dataIndex: "horas_traslado",
      key: "horas_traslado",
      className: "ant-table-column-horas-traslado",
    },
    {
      title: "Horas Recolección",
      dataIndex: "horas_recoleccion",
      key: "horas_recoleccion",
      className: "ant-table-column-horas-recoleccion",
    },
    {
      title: "Cantidad Árboles Aplicados",
      dataIndex: "cantidad_arboles_aplicados",
      key: "cantidad_arboles_aplicados",
      className: "ant-table-column-cantidad-arboles-aplicados",
    },
    {
      title: "Cantidad Litros Aplicados",
      dataIndex: "cantidad_litros_aplicados",
      key: "cantidad_litros_aplicados",
      className: "ant-table-column-cantidad-litros-aplicados",
    },
    {
      title: "Cantidad Árboles Fertilizados",
      dataIndex: "cantidad_arboles_fertilizados",
      key: "cantidad_arboles_fertilizados",
      className: "ant-table-column-cantidad-arboles-fertilizados",
    },
    {
      title: "Cantidad Kilos Aplicados",
      dataIndex: "cantidad_kilos_aplicados",
      key: "cantidad_kilos_aplicados",
      className: "ant-table-column-cantidad-kilos-aplicados",
    },
    {
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      className: "ant-table-column-observaciones",
    },

    // Columna para el Supervisor

    {
      title: "Supervisor",
      render: (text, record) =>
        record.Supervisor
          ? `${record.Supervisor.nombre} ${record.Supervisor.apellido}`
          : "",
      key: "supervisor",
      className: "ant-table-column-supervisor",
    },

    {
      title: "Acciones",
      key: "acciones",
      render: (text, record) => (
        <Button
          icon={<EditOutlined />} // Asegúrate de importar este icono de Ant Design
          className="edit-button"
          onClick={() => onEditClick(record)}
        >
          Editar
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ pageSize: 50 }}
      scroll={{ x: "max-content", y: 400 }} // Scroll horizontal y altura de la tabla con scroll
      onRow={(record) => ({
        onClick: () => onEditClick(record),
      })}
    />
  );
};

export default TableComponent;
