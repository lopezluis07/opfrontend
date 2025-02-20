import React, { useState, useEffect } from "react";
import axios from "axios";
import { notification } from "antd";
import NavigationBar from "./Navbar"; // Asegúrate de importar el Navbar

const ActivityManagement = () => {
    const [activities, setActivities] = useState([]);
    const [formData, setFormData] = useState({ nombre: "" });
    const [subactividades, setSubactividades] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const axiosInstance = axios.create({
        baseURL: "http://192.168.1.99:3001/api",
    });

    // Obtener actividades al cargar el componente
    const fetchActivities = async () => {
        try {
            const response = await axiosInstance.get("/actividades");
            setActivities(response.data);
        } catch (error) {
            console.error("Error al obtener actividades:", error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    // Manejar cambios en las subactividades
    const handleSubactividadChange = (index, value) => {
        const updatedSubactividades = [...subactividades];
        updatedSubactividades[index].nombre = value;
        setSubactividades(updatedSubactividades);
    };

    // Agregar nueva subactividad
    const handleAddSubactividad = () => {
        setSubactividades([...subactividades, { nombre: "" }]);
    };

    // Eliminar subactividad
    const handleRemoveSubactividad = (index) => {
        const updatedSubactividades = subactividades.filter((_, i) => i !== index);
        setSubactividades(updatedSubactividades);
    };


    // Crear o actualizar actividad
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) {
            notification.error({
                message: "Error de validación",
                description: "El nombre de la actividad no puede estar vacío.",
                placement: "topRight",
            });
            return;
        }

        try {
            const payload = {
                nombre: formData.nombre,
                subactividades: subactividades.filter((sub) => sub.nombre.trim() !== ""),
            };

            if (editingId) {
                await axiosInstance.put(`/actividades/${editingId}`, payload);
                notification.success({
                    message: "Actividad actualizada",
                    description: "La actividad se actualizó correctamente.",
                });
            } else {
                await axiosInstance.post("/actividades", payload);
                notification.success({
                    message: "Actividad creada",
                    description: "La actividad se creó correctamente.",
                });
            }

            setFormData({ nombre: "" });
            setSubactividades([]);
            setEditingId(null);
            fetchActivities();
        } catch (error) {
            console.error("Error al guardar la actividad:", error.response?.data || error.message);
            notification.error({
                message: "Error al guardar",
                description: "Hubo un problema al guardar la actividad.",
            });
        }
    };


    // Eliminar actividad
    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/actividades/${id}`);
            notification.success({
                message: "Actividad eliminada",
                description: "La actividad se eliminó correctamente.",
            });
            fetchActivities();
        } catch (error) {
            console.error("Error al eliminar la actividad:", error.response?.data || error.message);
            notification.error({
                message: "Error al eliminar",
                description: "Hubo un problema al eliminar la actividad.",
            });
        }
    };


    // Editar actividad
    const handleEdit = (activity) => {
        setFormData({ nombre: activity.nombre });
        setSubactividades(activity.subactividades || []);
        setEditingId(activity.id);
    };

    return (
        <div>
            <NavigationBar /> {/* Agrega el Navbar */}
            <div className="container">
                <h2 className="text-center my-4">Gestión de Actividades</h2>
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="row">
                        <div className="col-md-8">
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Nombre de la actividad"
                            />
                        </div>
                        <div className="col-md-4">
                            <button type="submit" className="btn btn-success w-100">
                                {editingId ? "Actualizar" : "Crear"}
                            </button>
                        </div>
                    </div>


                    {/* Subactividades */}
                    <div className="mb-3">
                        <label htmlFor="subactividades">Subactividades (opcional)</label>
                        <div id="subactividades">
                            {subactividades.map((sub, index) => (
                                <div key={index} className="d-flex align-items-center mb-2">
                                    <input
                                        type="text"
                                        value={sub.nombre}
                                        onChange={(e) => handleSubactividadChange(index, e.target.value)}
                                        className="form-control me-2"
                                        placeholder="Nombre de la subactividad"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => handleRemoveSubactividad(index)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-secondary mt-2"
                                onClick={handleAddSubactividad}
                            >
                                Agregar Subactividad
                            </button>
                        </div>
                    </div>


                </form>
                <table className="table table-striped">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((activity, index) => (
                            <tr key={activity.id}>
                                <td>{index + 1}</td>
                                <td>{activity.nombre}</td>
                                <td>
                                    <button
                                        onClick={() => handleEdit(activity)}
                                        className="btn btn-primary me-2"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(activity.id)}
                                        className="btn btn-danger"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityManagement;
