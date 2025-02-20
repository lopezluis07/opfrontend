import React, { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/api';
import { Button, Modal, Form } from 'react-bootstrap';
import NavigationBar from "./Navbar";
import { notification } from 'antd';


const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState(null);
    const [loading, setLoading] = useState(false);

    // Estado para los campos del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: '',
        rol: 'Operario',
        password: '', // Se agrega el campo password
        usuario: '',  // El nombre de usuario único
        fecha_ingreso: '',  // Fecha de ingreso
    });

    // Cargar los usuarios al montar el componente
    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const data = await getUsuarios();
            setUsuarios(data);
            notification.success({
                message: 'Usuarios cargados',
                description: 'Los usuarios se cargaron correctamente.',
                placement: 'topRight',
            });
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            notification.error({
                message: 'Error al cargar usuarios',
                description: 'Hubo un problema al cargar la lista de usuarios.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };



    // Abrir el modal para crear un nuevo usuario
    const handleCreate = () => {
        setFormData({
            nombre: '',
            apellido: '',
            cedula: '',
            telefono: '',
            rol: 'Operario',
            password: '',  // El campo password siempre debe estar vacío al crear un usuario
            usuario: '',
            fecha_ingreso: '',
        });
        setEditingUsuario(null); // Estamos creando uno nuevo
        setShowModal(true);
    };




    // Abrir el modal para editar un usuario existente
    const handleEdit = (usuario) => {
        const fechaIngresoFormateada = usuario.fecha_ingreso
            ? new Date(usuario.fecha_ingreso).toISOString().split('T')[0]
            : '';

        setFormData({
            ...usuario,
            usuario: usuario.usuario || '', // Asegúrate de que no sea undefined
            password: '', // No se rellena el campo password por seguridad
            fecha_ingreso: fechaIngresoFormateada,
        });

        setEditingUsuario(usuario.id); // Guardar el ID del usuario que está siendo editado
        setShowModal(true);
    };


    // Manejar el cierre del modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUsuario(null);
    };

    // Manejar los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Manejar el envío del formulario para crear o editar un usuario
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones según el rol
        if (['Admin', 'Supervisor', 'Conductor', 'Mantenimiento'].includes(formData.rol)) {
            if (formData.usuario.length < 6) {
                notification.warning({
                    message: 'Validación fallida',
                    description: 'El nombre de usuario debe tener al menos 6 caracteres.',
                    placement: 'topRight',
                });
                return;
            }

            if (formData.password.length < 6) {
                notification.warning({
                    message: 'Validación fallida',
                    description: 'La contraseña debe tener al menos 6 caracteres.',
                    placement: 'topRight',
                });
                return;
            }
        }

        // Limpiar campos (quitar espacios en blanco)
        const cleanedFormData = {
            ...formData,
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            telefono: formData.telefono.trim(),
            usuario: formData.usuario.trim(),
            password: formData.password.trim(),
            fecha_ingreso: formData.fecha_ingreso || null,  // Asegurar que fecha_ingreso esté presente o sea null si no hay
        };


        // Eliminar campos no necesarios si el rol no los requiere
        if (formData.rol === 'Operario') {
            delete cleanedFormData.usuario;
            delete cleanedFormData.password;
        }

        try {
            if (editingUsuario) {
                if (!cleanedFormData.password) {
                    delete cleanedFormData.password; // No enviar la contraseña si no se actualiza
                }

                const response = await updateUsuario(editingUsuario, cleanedFormData);
                notification.success({
                    message: 'Usuario actualizado',
                    description: 'El usuario se actualizó correctamente.',
                    placement: 'topRight',
                });
            } else {
                const response = await createUsuario(cleanedFormData);
                notification.success({
                    message: 'Usuario creado',
                    description: 'El usuario se creó correctamente.',
                    placement: 'topRight',
                });
            }

            loadUsuarios(); // Recargar lista
            handleCloseModal(); // Cerrar modal
        } catch (error) {
            console.error("Error al crear/editar usuario:", error);
            notification.error({
                message: 'Error al guardar usuario',
                description: 'Hubo un problema al guardar el usuario.',
                placement: 'topRight',
            });
        }
    };


    // Manejar la eliminación del usuario
    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await deleteUsuario(id);
                notification.success({
                    message: 'Usuario eliminado',
                    description: 'El usuario se eliminó correctamente.',
                    placement: 'topRight',
                });
                loadUsuarios();
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                notification.error({
                    message: 'Error al eliminar usuario',
                    description: 'Hubo un problema al eliminar el usuario.',
                    placement: 'topRight',
                });
            }
        }
    };


    return (
        <div>
            <NavigationBar />
            <div className="usuarios">
                <h2>Gestión de Usuarios</h2>
                <Button onClick={handleCreate} variant="primary">Crear Usuario</Button>
                <div className="table-responsive">
                    <table className="table table-striped table-hover mt-4">
                        <thead className="table-dark">
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Cédula</th>
                                <th>Teléfono</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(usuario => (
                                <tr key={usuario.id}>
                                    <td>{usuario.nombre}</td>
                                    <td>{usuario.apellido}</td>
                                    <td>{usuario.cedula}</td>
                                    <td>{usuario.telefono}</td>
                                    <td>{usuario.rol}</td>
                                    <td>
                                        <Button variant="warning" className="btn-sm me-2" onClick={() => handleEdit(usuario)}> Editar </Button>
                                        <Button variant="danger" className="btn-sm me-2" onClick={() => handleDelete(usuario.id)}> Eliminar </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal para crear/editar usuario */}
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editingUsuario ? 'Editar Usuario' : 'Crear Usuario'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group>
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Apellido</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Cédula</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cedula"
                                    value={formData.cedula}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Rol</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="rol"
                                    value={formData.rol}
                                    onChange={handleChange}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Conductor">Conductor</option>
                                    <option value="Mantenimiento">Mantenimiento</option>
                                    <option value="Operario">Operario</option>
                                    <option value="Supervisor">Supervisor</option>

                                </Form.Control>
                            </Form.Group>

                            {['Admin', 'Supervisor', 'Conductor', 'Mantenimiento'].includes(formData.rol) && (
                                <>
                                    <Form.Group>
                                        <Form.Label>Usuario</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="usuario"
                                            value={formData.usuario}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Contraseña</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </>
                            )}

                            <Form.Group>
                                <Form.Label>Fecha de Ingreso</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fecha_ingreso"
                                    value={formData.fecha_ingreso}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                {editingUsuario ? 'Actualizar' : 'Crear'}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
        </div >
    );
};

export default Usuarios;
