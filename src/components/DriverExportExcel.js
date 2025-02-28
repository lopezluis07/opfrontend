// DriverExportExcel.js
import axios from "axios";
import * as XLSX from "xlsx";
import { notification } from "antd";


export async function exportAllRecordsToExcel() {
    try {
        // 1. Tomar el token para autenticar la solicitud
        const token = localStorage.getItem("token");

        // 2. Hacer la solicitud al backend
        const response = await axios.get("http://18.205.204.20:3001/api/conductores", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // 3. Convertir la data para Excel
        const data = response.data.map((rec) => ({
            "ID Registro": rec.id,
            // Nombre completo en vez de usuario_id
            "Usuario": rec.Usuario
                ? `${rec.Usuario.nombre} ${rec.Usuario.apellido}`
                : "Desconocido",
            "Sección": rec.zona,
            "Fecha": rec.fecha,
            "Hora Inicio": rec.hora_inicio,
            "Hora Fin": rec.hora_fin,
            "Kilometraje Inicio": rec.kilometraje_inicio,
            "Kilometraje Fin": rec.kilometraje_fin,
            "Cantidad Entregada": rec.cantidad_entregada,
            "Observaciones": rec.observaciones,
            "Actividad": rec.actividad,
        }));

        // 4. Crear la hoja y el libro
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");

        // 5. Guardar el archivo
        XLSX.writeFile(workbook, `Registros_Conductores.xlsx`);

        // Opcional: notificación de éxito
        notification.success({
            message: "Exportación Exitosa",
            description: `Se han exportado ${data.length} registros.`,
            placement: "topRight",
        });
    } catch (error) {
        console.error("Error al exportar Excel:", error);
        notification.error({
            message: "Error al exportar Excel",
            description: error.response?.data || error.message,
            placement: "topRight",
        });
    }
}
