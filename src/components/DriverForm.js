import React, { useState, useEffect } from "react";
import axios from "axios";
import { notification } from "antd";
import NavigationBar from "./Navbar";
import "../assets/styles/DriverForm.css";


const DriverForm = () => {
    const [formData, setFormData] = useState({
        zona: "",
        fecha: new Date().toISOString().split("T")[0],
        hora_inicio: "",
        hora_fin: "",
        kilometraje_inicio: "",
        kilometraje_fin: "",
        cantidad_entregada: "",
        observaciones: "",
        actividad: "",
    });

    const [records, setRecords] = useState([]);
    const [editingId, setEditingId] = useState(null);


    // Lista de actividades
    const actividadesDisponibles = [
        "Cargue de madera",
        "Cosecha",
        "Cosecha - traslado de canastillas",
        "Desbrozadora",
        "Desbrozar ramas(podas)",
        "Desmontar llanta",
        "Diligencia",
        "Distribución de agua",
        "Distribución de canecas e isotanques",
        "Distribución de insumos",
        "distribución de material obras",
        "Distribución enmiendas",
        "Distribución estacionarias",
        "Distribución fertilizante",
        "Distribución herramientas",
        "Hacer soportes trampas",
        "Instalar letreros",
        "Instalar trampas",
        "Lavado del vehículo",
        "Llenar canecas e isotanques",
        "Llevar ACPM",
        "Llevar estibas",
        "Llevar insumos",
        "Mantenimiento de trampas",
        "Mantenimiento de vehiculo",
        "Mantenimiento desbrozadora",
        "Montar llantas",
        "Pintar con compresor",
        "Pintar con estacionaria",
        "Recoger madera",
        "Recoleccion de herramientas y equipos",
        "Recolección de insumos",
        "Remojar placa huella",
        "Remolcar vehículos",
        "Riper",
        "Tanqueo vehículo",
        "Traslado de basura",
        "Traslado de sillas y mesas",
    ];

    // Configuración global de Axios
    const axiosInstance = axios.create({
        baseURL: "http://192.168.1.99:3001/api",
    });


    axiosInstance.interceptors.request.use((config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });


    useEffect(() => {
        fetchAllRecords();
    }, []);

    // Traer todos los registros
    const fetchAllRecords = async () => {
        try {
            const response = await axiosInstance.get("/conductores");
            setRecords(response.data);
        } catch (error) {
            console.error("Error al obtener los registros:", error.response?.data || error.message);
        }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Validar y enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar SECCIÓN (zona)
        if (!formData.zona) {
            notification.error({
                message: "Error de validación",
                description: "Debe seleccionar una sección.",
                placement: "topRight",
            });
            return;
        }

        // Validar hora de inicio sea obligatoria
        if (!formData.hora_inicio) {
            notification.error({
                message: "Error de validación",
                description: "La hora de inicio es obligatoria.",
                placement: "topRight",
            });
            return;
        }

        // Validar hora de inicio < hora fin (si ambas están definidas)
        if (formData.hora_inicio && formData.hora_fin) {
            if (formData.hora_inicio >= formData.hora_fin) {
                notification.error({
                    message: "Error de validación",
                    description: "La hora de inicio debe ser anterior a la hora de fin.",
                    placement: "topRight",
                });
                return;
            }
        }

        // Validar kilometraje_inicio obligatorio
        if (!formData.kilometraje_inicio) {
            notification.error({
                message: "Error de validación",
                description: "El kilometraje inicial es obligatorio.",
                placement: "topRight",
            });
            return;
        }

        const payload = {
            zona: formData.zona,
            fecha: formData.fecha,
            hora_inicio: formData.hora_inicio,
            hora_fin: formData.hora_fin,
            kilometraje_inicio: formData.kilometraje_inicio,
            kilometraje_fin: formData.kilometraje_fin,
            cantidad_entregada: formData.cantidad_entregada,
            observaciones: formData.observaciones,
            actividad: formData.actividad || null,
        };

        try {
            if (editingId) {
                await axiosInstance.put(`/conductores/${editingId}`, payload);
            } else {
                await axiosInstance.post("/conductores", payload);
            }

            // Limpiar formulario
            setFormData({
                zona: "",
                fecha: new Date().toISOString().split("T")[0],
                hora_inicio: "",
                hora_fin: "",
                kilometraje_inicio: "",
                kilometraje_fin: "",
                cantidad_entregada: "",
                observaciones: "",
                actividad: "",
            });
            setEditingId(null);
            fetchAllRecords();
        } catch (error) {
            console.error("Error al enviar los datos:", error.response?.data || error.message);
        }
    };

    const handleEdit = (record) => {
        setFormData({
            zona: record.zona,
            fecha: record.fecha,
            hora_inicio: record.hora_inicio,
            hora_fin: record.hora_fin,
            kilometraje_inicio: record.kilometraje_inicio,
            kilometraje_fin: record.kilometraje_fin,
            cantidad_entregada: record.cantidad_entregada,
            observaciones: record.observaciones,
            actividad: record.actividad || "",
        });
        setEditingId(record.id);
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/conductores/${id}`);
            fetchAllRecords();
        } catch (error) {
            console.error("Error al eliminar el registro:", error.response?.data || error.message);
        }
    };




    const token = localStorage.getItem("token");
    let usuarioId = null;
    let rolUsuario = null;

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            usuarioId = payload.usuarioId;
            rolUsuario = payload.role;
        } catch (error) {
            console.error("Error al decodificar el token:", error);
        }
    }




    // Filtra registros: solo del usuario autenticado y fecha actual
    const hoy = new Date().toISOString().split("T")[0];


    const registrosFiltrados = records.filter((record) => {
        
        if (rolUsuario === "Admin") {
            // Admin puede ver todos los registros del día actual
            return record.fecha === hoy;
        }

        if (rolUsuario === "Supervisor") {
            // Supervisor solo puede ver sus propios registros del día actual
            return record.fecha === hoy && record.usuario_id === usuarioId;
        }

        if (rolUsuario === "Conductor") {
            // Conductor solo puede ver sus propios registros del día actual
            return record.fecha === hoy && record.usuario_id === usuarioId;
        }
        return false;
    });





    // Función para invocar la exportación global
    const exportAllData = () => {
        // Import dinámico o directo, como prefieras:
        import("./DriverExportExcel").then(({ exportAllRecordsToExcel }) => {
            exportAllRecordsToExcel();
        });
    };



    return (
        <>
            <NavigationBar />
            <div className="container-fluid">
                <h2 className="text-center my-4">Registro de Conductores</h2>

                {/* Botón para exportar a Excel */}
                <div className="text-center mb-3">
                    <button className="btn btn-secondary" onClick={exportAllData}>
                        Exportar Registros Conductores
                    </button>
                </div>

                <form className="form-container" onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-12">
                            <label>Sección</label>
                            <select
                                name="zona"
                                value={formData.zona}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="">Seleccione una sección</option>
                                <option value="Buenos Aires">Buenos Aires</option>
                                <option value="Santa Barbara">Santa Barbara</option>
                                <option value="Santo Domingo">Santo Domingo</option>
                            </select>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-12 col-md-6 mb-3 mb-md-0">
                            <label>Fecha</label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                className="form-control"
                                max={new Date().toISOString().split("T")[0]}
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label>Hora Inicio</label>
                            <input
                                type="time"
                                name="hora_inicio"
                                value={formData.hora_inicio}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-12 col-md-4 mb-3 mb-md-0">
                            <label>Hora Fin</label>
                            <input
                                type="time"
                                name="hora_fin"
                                value={formData.hora_fin}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="col-12 col-md-4 mb-3 mb-md-0">
                            <label>Kilometraje Inicio</label>
                            <input
                                type="number"
                                name="kilometraje_inicio"
                                value={formData.kilometraje_inicio}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="col-12 col-md-4">
                            <label>Kilometraje Fin</label>
                            <input
                                type="number"
                                name="kilometraje_fin"
                                value={formData.kilometraje_fin}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-12 col-md-6">
                            <label>Actividad</label>
                            <select
                                name="actividad"
                                value={formData.actividad}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="">Sin actividad</option>
                                {actividadesDisponibles.map((act, index) => (
                                    <option key={index} value={act}>{act}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-12 col-md-6 mb-3 mb-md-0">
                            <label>Cantidad Entregada</label>
                            <input
                                type="text"
                                name="cantidad_entregada"
                                value={formData.cantidad_entregada}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="col-12 col-md-6">
                            <label>Observaciones</label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                className="form-control"
                            ></textarea>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-success mt-3 w-100">
                        {editingId ? "Actualizar" : "Enviar"}
                    </button>
                </form>

                <h3 className="mt-4">Registros de Hoy</h3>
                <div className="table-responsive">
                    <table className="table table-striped mt-2">
                        <thead className="table-dark">
                            <tr>
                                <th>Sección</th>
                                <th>Fecha</th>
                                <th>Hora Inicio</th>
                                <th>Hora Fin</th>
                                <th>Kilometraje</th>
                                <th>Cantidad</th>
                                <th>Observaciones</th>
                                <th>Actividad</th>
                                <th>Usuario</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrosFiltrados.map((record) => (
                                <tr key={record.id}>
                                    <td>{record.zona}</td>
                                    <td>{record.fecha}</td>
                                    <td>{record.hora_inicio}</td>
                                    <td>{record.hora_fin}</td>
                                    <td>{`${record.kilometraje_inicio || "-"} - ${record.kilometraje_fin || "-"}`}</td>
                                    <td>{record.cantidad_entregada}</td>
                                    <td>{record.observaciones}</td>
                                    <td>{record.actividad || "-"}</td>
                                    <td>
                                        {record.Usuario?.nombre} {record.Usuario?.apellido}
                                    </td>


                                    <td>
                                        <div className="btn-group" role="group">
                                            <button
                                                className="btn btn-primary btn-lg"
                                                onClick={() => handleEdit(record)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn btn-danger btn-lg"
                                                onClick={() => handleDelete(record.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default DriverForm;
