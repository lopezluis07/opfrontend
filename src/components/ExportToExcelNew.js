import React from "react";
import * as XLSX from "xlsx";
import { Button } from "antd";
import moment from "moment";
import "moment/locale/es"; // Configurar moment.js para español
import { saveAs } from "file-saver";
import { FileExcelOutlined } from "@ant-design/icons";

const ExportToExcelNew = ({ registros = [] }) => {
    moment.locale("es");

    const exportToExcel = () => {
        if (registros.length === 0) {
            alert("No hay datos disponibles para exportar.");
            return;
        }


        // Transformar los datos para incluir los parámetros necesarios
        const excelData = registros.map((registro) => ({
            FECHA: moment(registro.fecha).format("YYYY-MM-DD"),
            MES: moment(registro.fecha).format("MMMM"),
            SECCIÓN: registro.Seccion ? registro.Seccion.nombre : "N/A",
            "CANTIDAD DE HORAS TRABAJADAS": registro.horas_labor || "0",
            "HORAS DE LLUVIA": registro.horas_lluvia || "0",
            "CEDULA COLABORADOR": registro.Usuario ? registro.Usuario.cedula : "N/A",
            "NOMBRE DEL TRABAJADOR": registro.Usuario
                ? `${registro.Usuario.apellido} ${registro.Usuario.nombre}`
                : "N/A",
            "CODIGO LABOR": registro.CodigoLabor || "",
            "DESCRIPCIÓN DE LA CATEGORÍA": registro.Actividad
                ? registro.Actividad.nombre
                : "N/A",
            CANTIDAD:
                registro.Actividad?.id === 1 || registro.Actividad?.id === 5
                    ? registro.cantidad_litros_aplicados || "0"
                    : registro.Actividad?.id === 2
                        ? registro.cantidad_kilos_aplicados || "0"
                        : registro.rendimiento || "", // Implementa la lógica dinámica
            CUMPLIMIENTO: registro.cumplimiento ? `${registro.cumplimiento}%` : "",
            ESTADO: registro.estado || "",
            OBSERVACIONES: registro.observaciones || "",
        }));

        // Crear la hoja de cálculo
        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(worksheet, [
            [
                "FECHA",
                "MES",
                "SECCIÓN",
                "CANTIDAD DE HORAS TRABAJADAS",
                "HORAS DE LLUVIA",
                "CEDULA COLABORADOR",
                "NOMBRE DEL TRABAJADOR",
                "CODIGO LABOR",
                "DESCRIPCIÓN DE LA CATEGORÍA",
                "CANTIDAD",
                "CUMPLIMIENTO",
                "ESTADO",
                "OBSERVACIONES",
            ],
        ]);

        // Agregar los datos después de los encabezados, evitando encabezados duplicados
        XLSX.utils.sheet_add_json(worksheet, excelData, {
            origin: "A2", // Comienza desde la fila 2
            skipHeader: true, // Evita generar encabezados automáticamente
        });

        // Ajustar el ancho de las columnas automáticamente
        const columnWidths = [
            { wch: 12 }, // FECHA
            { wch: 10 }, // MES
            { wch: 15 }, // SECCIÓN
            { wch: 35 }, // CANTIDAD DE HORAS TRABAJADAS
            { wch: 15 }, // HORAS DE LLUVIA
            { wch: 20 }, // CEDULA COLABORADOR
            { wch: 30 }, // NOMBRE DEL TRABAJADOR
            { wch: 15 }, // CODIGO LABOR
            { wch: 35 }, // DESCRIPCIÓN DE LA CATEGORÍA
            { wch: 12 }, // CANTIDAD
            { wch: 20 }, // CUMPLIMIENTO
            { wch: 12 }, // ESTADO
            { wch: 20 }, // OBSERVACIONES
        ];
        worksheet["!cols"] = columnWidths;


        // Crear el libro de trabajo
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Control Operativo");

        // Generar el archivo Excel
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "Control_operativo.xlsx");
    };

    return (
        <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={exportToExcel}
            style={{ marginBottom: 16 }}
        >
            Exportar Control Operativo
        </Button>
    );
};

export default ExportToExcelNew;
