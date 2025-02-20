import React, { useState, useEffect } from "react";
import { notification } from "antd";
import { createRegistroOperario, getUsuarios, getActividades, getSubactividades, getSecciones, getLotes, } from "../services/api";
import Select from "react-select";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import NavigationBar from "./Navbar";
import PausasActivasCheckboxes from "./PausasActivasCheckboxes";
import "../assets/styles/RegistroForm.css";


const userAuthenticated = {
  role: "Supervisor",
};

const UNIDAD_MEDIDA_OPTIONS = [
  { value: "Hectáreas", label: "Hectáreas" },
  { value: "Kilogramos", label: "Kilogramos" },
  { value: "Litros", label: "Litros" },
  { value: "Metros", label: "Metros" },
  { value: "Unidad", label: "Unidad" },
];


// utilidad para obtener la fecha actual en formato "YYYY-MM-DD"
const obtenerFechaActual = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const RegistroForm = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedOperarios, setSelectedOperarios] = useState([]);
  const [validated, setValidated] = useState(false);

  const [registro, setRegistro] = useState({
    usuario_id: [],
    fecha: obtenerFechaActual(),
    actividad_id: "",
    subactividades_id: [],
    seccion_id: "",
    lote_ids: [],
    hora_inicio: "06:30",
    hora_fin: "17:00",
    horas_labor: "",
    horas_lluvia: "",
    horas_traslado: "",
    horas_recoleccion: "",
    observaciones: "",
    cantidad_arboles_aplicados: "",
    cantidad_litros_aplicados: "",
    cantidad_arboles_fertilizados: "",
    cantidad_kilos_aplicados: "",
    rendimiento: "",
    unidad_medida: "",
    descuentoManana: true,
    descuentoTarde: true,
  });

  const [arbolesPorOperario, setArbolesPorOperario] = useState({});
  const [fertilizadosPorOperario, setFertilizadosPorOperario] = useState({});
  const [errorHoras, setErrorHoras] = useState("");
  const [actividades, setActividades] = useState([]);
  const [subactividades, setSubactividades] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [lotes, setLotes] = useState([]);


  const handleSelectChange = (selectedOption, fieldName) => {
    setRegistro((prev) => ({
      ...prev,
      [fieldName]: selectedOption ? selectedOption.value : '',
    }));
  };

  useEffect(() => {
    getUsuarios().then((data) => {
      let filteredUsers;
      if (userAuthenticated.role !== "Admin") {
        filteredUsers = data.filter(
          (usuario) => usuario.rol !== "Admin" && usuario.rol !== "Supervisor"
        );
      } else {
        filteredUsers = data;
      }
      filteredUsers.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setUsuarios(filteredUsers);
    });
    getActividades().then((data) => setActividades(data));
    getSecciones().then((data) => setSecciones(data));
  }, []);

  // Manejar la selección de operarios
  const handleOperariosChange = (selectedOptions) => {
    const operariosSeleccionados = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setSelectedOperarios(selectedOptions);
    setRegistro((prev) => ({ ...prev, usuario_id: operariosSeleccionados })); // Aquí nos aseguramos de asignar los IDs al estado
  };

  const validarHoras = () => {
    if (registro.hora_inicio && registro.hora_fin) {
      const [horaInicio, minutoInicio] = registro.hora_inicio.split(":");
      const [horaFin, minutoFin] = registro.hora_fin.split(":");

      const inicio = new Date();
      inicio.setHours(horaInicio, minutoInicio);

      const fin = new Date();
      fin.setHours(horaFin, minutoFin);

      if (fin <= inicio) {
        setErrorHoras("La hora de fin debe ser posterior a la hora de inicio.");
        return false;
      }
    }
    setErrorHoras("");
    return true;
  };

  useEffect(() => {
    getActividades().then((data) => {
      data.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setActividades(data);
    });
  }, []);

  useEffect(() => {
    if (registro.actividad_id) {
      setRegistro((prev) => ({ ...prev, subactividades_id: [] }));
      getSubactividades(registro.actividad_id).then((data) => {
        data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setSubactividades(data);
      });
    } else {
      setSubactividades([]);
    }
  }, [registro.actividad_id]);

  useEffect(() => {
    if (registro.seccion_id) {
      setRegistro((prev) => ({ ...prev, lote_ids: [] }));
      getLotes(registro.seccion_id).then((data) => {
        data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setLotes(data);
      });
    } else {
      setLotes([]);
    }
  }, [registro.seccion_id]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegistro((prev) =>({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const handleArbolesPorOperarioChange = (operarioId, cantidad) => {
    setArbolesPorOperario((prev) => ({
      ...prev,
      [operarioId]: Number(cantidad), // Asegurar que sea un número
    }));
  };


  const handleFertilizadosPorOperarioChange = (operarioId, cantidad) => {
    setFertilizadosPorOperario((prev) => ({
      ...prev,
      [operarioId]: Number(cantidad), // Asegura que el valor sea un número
    }));
  };



  const handleSubactividadesChange = (selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setRegistro((prev) => ({
      ...prev,
      subactividades_id: selectedValues,
    }));
  };

  const handleLotesChange = (selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setRegistro((prev) => ({
      ...prev,
      lote_ids: selectedValues,
    }));
  };

  // Validar que los datos del formulario sean correctos
  const validarFormulario = () => {
    if (!validarHoras()) {
      return false;
    }

    const operarios = registro.usuario_id;
    if (!operarios || operarios.length === 0) {
      notification.error({
        message: "Error de validación",
        description: "Debe seleccionar al menos un operario.",
      });
      return false;
    }

    // Validar litros solo si la actividad es Fumigación Foliar
    if (
      (registro.actividad_id === 1 || registro.actividad_id === 5) && // IDs de Fumigación Foliar
      !registro.cantidad_litros_aplicados
    ) {
      notification.error({
        message: "Error de validación",
        description: "Debe ingresar la cantidad de litros aplicados.",
      });
      return false;
    }

    return true;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      if (!validarHoras()) {
        notification.error({
          message: "Error de validación",
          description: "La hora de inicio deber ser anterior a la hora de fin.",
          placement: "topRight",
        });
        return;
      }


      if (!registro.usuario_id || registro.usuario_id.length === 0) {
        notification.error({
          message: "Error de validación",
          description: "Por favor, seleccione al menos un operario.",
          placement: "topRight",
        });
        return;
      }


      let litrosDivididos = 0;
      if (registro.cantidad_litros_aplicados && selectedOperarios.length > 0) {
        litrosDivididos = (
          Number(registro.cantidad_litros_aplicados) / selectedOperarios.length
        ).toFixed(2);



        // Actualizamos el campo cantidad_litros_aplicados con los litros divididos
        setRegistro((prev) => ({
          ...prev,
          cantidad_litros_aplicados: litrosDivididos,
        }));
      }



      const registroConHoras = {
        ...registro,
        usuario_ids: Array.isArray(registro.usuario_id)
          ? registro.usuario_id
          : [registro.usuario_id],
        horas_lluvia: Number(registro.horas_lluvia) / 60 || 0,
        horas_traslado: Number(registro.horas_traslado) / 60 || 0,
        horas_recoleccion: Number(registro.horas_recoleccion) / 60 || 0,
        cantidad_arboles_aplicados: Number(registro.cantidad_arboles_aplicados) || 0,
        cantidad_litros_aplicados: litrosDivididos,
        cantidad_arboles_fertilizados: Number(registro.cantidad_arboles_fertilizados) || 0,
        cantidad_kilos_aplicados: Number(registro.cantidad_kilos_aplicados) || 0,
        rendimiento: Number(registro.rendimiento) || 0,
        arboles_por_operario: selectedOperarios.map((operario) => ({
          operarioId: operario.value,
          cantidadArboles: arbolesPorOperario[operario.value] || 0,
          cantidad_arboles_aplicados: arbolesPorOperario[operario.value] || 0,
          cantidad_arboles_fertilizados: fertilizadosPorOperario[operario.value] || 0,
        })),
      };



      if (
        !registroConHoras.usuario_ids || !registro.actividad_id || !registro.seccion_id || registro.lote_ids.length === 0) {
        notification.warning({
          message: "Campos incompletos",
          description: " Por favor complete todos los campos obligatorios.",
        });
        return;
      }


      try {
        await createRegistroOperario(registroConHoras);
        notification.success({
          message: "Registro  Creado",
          description: "El registro se ha creado exitosamente.",
          placement: "topRight",
        });

        setRegistro((prev) => ({
          ...prev,
          usuario_id: [],
          cantidad_arboles_aplicados: "",
          cantidad_litros_aplicados: "",
          cantidad_arboles_fertilizados: "",
        }));
        setSelectedOperarios([]);
        setValidated(false);
      } catch (error) {
        notification.error({
          message: "Error al Crear Registro:",
          description:
            error.response?.data?.detalles ||
            error.response?.data?.error ||
            error.message,
          placement: "topRight",
        });
      }
    }
    setValidated(true);
  };






  return (
    <div className="page-background">
      <NavigationBar />
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className="form-container mx-auto"
      >


        {/* Selección de Operarios */}

        <Form.Group>
          <Form.Label htmlFor="formUsuarios">Seleccionar Operarios:</Form.Label>
          <Select
            inputId="formUsuarios"
            value={selectedOperarios}
            options={usuarios.map((usuario) => ({
              value: usuario.id,
              label: `${usuario.nombre} ${usuario.apellido} - ${usuario.cedula}`,
            }))}
            onChange={handleOperariosChange}
            isMulti
            isClearable
            placeholder="Seleccionar operarios"
            isSearchable
          />
          <Form.Control.Feedback type="invalid">
            Por favor selecciona al menos un operario.
          </Form.Control.Feedback>
        </Form.Group>



        {/* Fecha */}

        <Form.Group>
          <Form.Label htmlFor="formFecha">Fecha:</Form.Label>
          <Form.Control
            id="formFecha"
            type="date"
            name="fecha"
            value={registro.fecha}
            max={obtenerFechaActual()}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Por favor ingrese una fecha válida.
          </Form.Control.Feedback>
        </Form.Group>


        {/* Actividad */}

        <Form.Group>
          <Form.Label htmlFor="formActividad">Actividad:</Form.Label>
          <Select
            inputId="formActividad"
            name="actividad_id"
            options={actividades.map((actividad) => ({
              value: actividad.id,
              label: actividad.nombre,
            }))}
            value={
              actividades.find(
                (actividad) => actividad.id === Number(registro.actividad_id)
              )
                ? {
                  value: registro.actividad_id,
                  label: actividades.find(
                    (actividad) =>
                      actividad.id === Number(registro.actividad_id)
                  ).nombre,
                }
                : null
            }
            onChange={(selectedOption) => {
              const selectedId = selectedOption ? selectedOption.value : "";
              setRegistro((prev) => ({
                ...prev,
                actividad_id: selectedId,
              }));
            }}
            isClearable
            isSearchable
            placeholder="Seleccionar actividad"
          />
          <Form.Control.Feedback type="invalid">
            Seleccione una actividad.
          </Form.Control.Feedback>
        </Form.Group>


        {/* Subactividades */}

        <Form.Group>
          <Form.Label htmlFor="formSubactividad">Subactividades:</Form.Label>
          <Select
            inputId="formSubactividad"
            isMulti
            options={subactividades.map((subactividad) => ({
              value: subactividad.id,
              label: subactividad.nombre,
            }))}
            value={subactividades
              .filter((subactividad) =>
                registro.subactividades_id.includes(subactividad.id)
              )
              .map((subactividad) => ({
                value: subactividad.id,
                label: subactividad.nombre,
              }))}
            onChange={handleSubactividadesChange}
          />
          <Form.Control.Feedback type="invalid">
            Seleccione al menos una subactividad.
          </Form.Control.Feedback>
        </Form.Group>



        {/* Sección */}

        <Form.Group>
          <Form.Label htmlFor="formSeccion">Sección:</Form.Label>
          <Form.Control
            id="formSeccion"
            as="select"
            name="seccion_id"
            value={registro.seccion_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar sección</option>
            {secciones.map((seccion) => (
              <option key={seccion.id} value={seccion.id}>
                {seccion.nombre}
              </option>
            ))}
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            Seleccione una sección.
          </Form.Control.Feedback>
        </Form.Group>



        {/* Lotes */}

        <Form.Group>
          <Form.Label htmlFor="formLote">Lotes:</Form.Label>
          <Select
            inputId="formLote"
            isMulti
            isSearchable={false}
            options={lotes.map((lote) => ({
              value: lote.id,
              label: lote.nombre,
            }))}
            value={lotes
              .filter((lote) => registro.lote_ids.includes(lote.id))
              .map((lote) => ({
                value: lote.id,
                label: lote.nombre,
              }))}
            onChange={handleLotesChange}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            menuShouldBlockScroll={true}
            placeholder="Seleccionar lotes"
            noOptionsMessage={() => "No se encontraron lotes"}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            menuPlacement="auto"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
          <Form.Control.Feedback type="invalid">
            Seleccione al menos un lote.
          </Form.Control.Feedback>
        </Form.Group>

        {/* Campos específicos según la actividad seleccionada */}
        {(Number(registro.actividad_id) === 1 || Number(registro.actividad_id) === 5) && (
          <>

            <Form.Group>
              <Form.Label htmlFor="formCantidadLitrosAplicados">Cantidad de litros aplicados:</Form.Label>
              <Form.Control
                id="formCantidadLitrosAplicados"
                type="number"
                name="cantidad_litros_aplicados"
                value={registro.cantidad_litros_aplicados}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="Ingrese los litros aplicados"
                required
              />
            </Form.Group>



            <Form.Group>
              <Form.Label>Cantidad de árboles por operario:</Form.Label>
              {selectedOperarios.map((operario) => (
                <div key={operario.value} className="mb-3">
                  <Form.Label htmlFor={`arboles-${operario.value}`}>
                    Árboles aplicados por {operario.label}
                  </Form.Label>
                  <Form.Control
                    id={`arboles-${operario.value}`}
                    type="number"
                    placeholder={`Árboles aplicados por ${operario.label}`}
                    value={arbolesPorOperario[operario.value] || ""}
                    onChange={(e) => handleArbolesPorOperarioChange(operario.value, e.target.value)}
                    min="0"
                  />
                </div>
              ))}
            </Form.Group>



            <p>
              <b>Total litros por operario:</b>{" "}
              {registro.cantidad_litros_aplicados && selectedOperarios.length > 0
                ? (Number(registro.cantidad_litros_aplicados) / selectedOperarios.length).toFixed(2)
                : 0}{" "}
              litros.
            </p>
          </>
        )}






        {/* Campos para otras actividades */}
        {Number(registro.actividad_id) === 2 && (
          <>
            <Form.Group>
              <Form.Label>Cantidad de árboles fertilizados por operario:</Form.Label>
              {selectedOperarios.map((operario) => (
                <div key={operario.value} className="mb-3">
                  <Form.Label htmlFor={`fertilizados-${operario.value}`}>
                    Árboles fertilizados por {operario.label}
                  </Form.Label>
                  <Form.Control
                    id={`fertilizados-${operario.value}`}
                    type="number"
                    placeholder={`Árboles fertilizados por ${operario.label}`}
                    value={fertilizadosPorOperario[operario.value] || ""}
                    onChange={(e) => handleFertilizadosPorOperarioChange(operario.value, e.target.value)}
                    min="0"
                  />
                </div>
              ))}
            </Form.Group>


            <Form.Group>
              <Form.Label htmlFor="formCantidadKilosAplicados">Cantidad de kilos aplicados:</Form.Label>
              <Form.Control
                id="formCantidadKilosAplicados"
                type="number"
                name="cantidad_kilos_aplicados"
                value={registro.cantidad_kilos_aplicados}
                onChange={handleChange}
                min="0"
                placeholder="Ingrese la cantidad de kilos aplicados"
              />
            </Form.Group>
          </>
        )}




        {/* Ocultar los campos de Rendimiento y Unidad de Medida solo si no es la actividad específica "1", "2", o "5" */}
        {Number(registro.actividad_id) !== 1 &&
          Number(registro.actividad_id) !== 2 &&
          Number(registro.actividad_id) !== 5 && (
            <>
              <Form.Group>
                <Form.Label htmlFor="formRendimiento">Rendimiento:</Form.Label>
                <Form.Control
                  id="formRendimiento"
                  type="number"
                  name="rendimiento"
                  value={registro.rendimiento}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Ingrese el rendimiento"
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Unidad de Medida:</Form.Label>
                <Select
                  options={UNIDAD_MEDIDA_OPTIONS}
                  value={UNIDAD_MEDIDA_OPTIONS.find((opt) => opt.value === registro.unidad_medida)}
                  onChange={(option) => handleSelectChange(option, "unidad_medida")}
                  placeholder="Seleccione unidad de medida"
                />
              </Form.Group>
            </>
          )}


        <Form.Group>
          <Form.Label htmlFor="formHoraInicio">Hora Inicio:</Form.Label>
          <Form.Control
            id="formHoraInicio"
            type="time"
            name="hora_inicio"
            value={registro.hora_inicio}
            onChange={handleChange}
            required
          />
        </Form.Group>


        <Form.Group>
          <Form.Label htmlFor="formHoraFin">Hora Fin:</Form.Label>
          <Form.Control
            id="formHoraFin"
            type="time"
            name="hora_fin"
            value={registro.hora_fin}
            onChange={handleChange}
            required
          />
          {errorHoras && <div className="text-danger mt-2">{errorHoras}</div>}
        </Form.Group>


        <Form.Group>
          <Form.Label htmlFor="formHorasLluvia">Horas Lluvia:</Form.Label>
          <Form.Control
            id="formHorasLluvia"
            type="number"
            step="0.01"
            name="horas_lluvia"
            value={registro.horas_lluvia}
            onChange={handleChange}
            min="0"
          />
        </Form.Group>


        <Form.Group>
          <Form.Label htmlFor="formHorasTraslado">Horas Traslado:</Form.Label>
          <Form.Control
            id="formHorasTraslado"
            type="number"
            step="0.01"
            name="horas_traslado"
            value={registro.horas_traslado}
            onChange={handleChange}
            min="0"
          />
        </Form.Group>


        <Form.Group>
          <Form.Label htmlFor="formHorasRecoleccion">
            Horas Recolección:
          </Form.Label>
          <Form.Control
            id="formHorasRecoleccion"
            type="number"
            step="0.01"
            name="horas_recoleccion"
            value={registro.horas_recoleccion}
            onChange={handleChange}
            min="0"
          />
        </Form.Group>



        <Form.Group>
          <Form.Label htmlFor="formObservaciones">Observaciones:</Form.Label>
          <Form.Control
            id="formObservaciones"
            as="textarea"
            name="observaciones"
            value={registro.observaciones}
            onChange={handleChange}
          />
        </Form.Group>



        {/* Checkboxes de pausas activas */}
        <PausasActivasCheckboxes
          descuentoManana={registro.descuentoManana}
          descuentoTarde={registro.descuentoTarde}
          onChange={handleChange}
          horaInicio={registro.hora_inicio}
          horaFin={registro.hora_fin}
        />

        <Button variant="primary" type="submit" className="submit-button">
          Crear Registro
        </Button>
      </Form>
    </div>
  );
};


export default RegistroForm;
