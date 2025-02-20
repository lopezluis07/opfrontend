import React from "react";
import * as XLSX from "xlsx";
import { Button } from "antd";
import moment from "moment";
import { saveAs } from "file-saver";
import { FileExcelOutlined } from "@ant-design/icons";

const ExportToExcel = ({
  registros = [], // Usamos directamente los registros ya filtrados
  maxSubactividades,
  maxLotes,
}) => {
  const exportToExcel = () => {
    if (registros.length === 0) {
      alert("No hay registros que coincidan con el filtro de fechas.");
      return;
    }

    const excelData = registros.map((registro) => {
      const subactividades = {};
      const lotes = {};

      for (let i = 0; i < maxSubactividades; i++) {
        subactividades[`Subactividad ${i + 1}`] =
          registro.Subactividades && registro.Subactividades[i]
            ? registro.Subactividades[i].nombre
            : "";
      }

      for (let i = 0; i < maxLotes; i++) {
        lotes[`Lote ${i + 1}`] =
          registro.Lotes && registro.Lotes[i] ? registro.Lotes[i].nombre : "";
      }

      return {
        ID: registro.id,
        Fecha: moment(registro.fecha).format("YYYY-MM-DD"),
        Operario: registro.Usuario
          ? `${registro.Usuario.nombre} ${registro.Usuario.apellido}`
          : "",
        Cedula: registro.Usuario ? registro.Usuario.cedula : "",
        Actividad: registro.Actividad ? registro.Actividad.nombre : "",
        ...subactividades,
        Sección: registro.Seccion ? registro.Seccion.nombre : "",
        ...lotes,
        Rendimiento: registro.rendimiento || "",
        "Unidad de Medida": registro.unidad_medida || "",
        "Hora Inicio": registro.hora_inicio || "",
        "Hora Fin": registro.hora_fin || "",
        "Horas Trabajo": registro.horas_labor || "",
        "Horas Lluvia": registro.horas_lluvia || "",
        "Horas Traslado": registro.horas_traslado || "",
        "Horas Recolección": registro.horas_recoleccion || "",
        "Cantidad Árboles Aplicados": registro.cantidad_arboles_aplicados || "",
        "Cantidad Litros Aplicados": registro.cantidad_litros_aplicados || "",
        "Cantidad Árboles Fertilizados":
          registro.cantidad_arboles_fertilizados || "",
        "Cantidad Kilos Aplicados": registro.cantidad_kilos_aplicados || "",
        Observaciones: registro.observaciones || "",
        Supervisor: registro.Supervisor
          ? `${registro.Supervisor.nombre} ${registro.Supervisor.apellido}`
          : "",
      };
    }); 

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "registros_operarios.xlsx");
  };

  return (
    <Button
      type="primary"
      icon={<FileExcelOutlined />}
      onClick={exportToExcel}
      style={{
        marginBottom: 16,
      }}
    >
      Exportar a Excel
    </Button>
  );
};

export default ExportToExcel;
