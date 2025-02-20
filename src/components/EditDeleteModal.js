import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Input, Select, Checkbox, message } from "antd";
import { deleteRegistro, updateRegistro, getSubactividades, getLotes, calcularHorasLabor } from "../services/api";

const EditDeleteModal = ({
  show,
  onHide,
  registro,
  onSave,
  usuarios,
  actividades,
  secciones,
}) => {
  const [form] = Form.useForm();
  const [filteredSubactividades, setFilteredSubactividades] = useState([]);
  const [filteredLotes, setFilteredLotes] = useState([]);
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [mostrarPausaManana, setMostrarPausaManana] = useState(false);
  const [mostrarPausaTarde, setMostrarPausaTarde] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);


  const formatRendimiento = (valor) => {
    return parseFloat(valor) % 1 === 0
      ? parseInt(valor, 10)
      : parseFloat(valor).toFixed(2);
  };


  // Cargar subactividades y lotes
  const loadOptions = async (type, id) => {
    try {
      if (type === "subactividades") {
        const data = await getSubactividades(id);
        setFilteredSubactividades(data);
      } else if (type === "lotes") {
        const data = await getLotes(id);
        setFilteredLotes(data);
      }
    } catch (error) {
      console.error(`Error al cargar ${type}:`, error);
      message.error(`Error al cargar ${type}`);
    }
  };

  // Recalcular horas laborables al usar el endpoint
  const calcularHoras = async () => {
    try {
      const valores = form.getFieldsValue([
        "hora_inicio",
        "hora_fin",
        "horas_lluvia",
        "horas_traslado",
        "horas_recoleccion",
        "descuentoManana",
        "descuentoTarde",
        "actividad_id",
      ]);

      const response = await calcularHorasLabor({
        horaInicio: valores.hora_inicio,
        horaFin: valores.hora_fin,
        horasLluvia: parseFloat(valores.horas_lluvia) || 0,
        horasTraslado: parseFloat(valores.horas_traslado) || 0,
        horasRecoleccion: parseFloat(valores.horas_recoleccion) || 0,
        actividad_id: valores.actividad_id || 0,
        descuentoManana: valores.descuentoManana || false,
        descuentoTarde: valores.descuentoTarde || false,
      });

      form.setFieldsValue({ horas_labor: response.horas_labor });
    } catch (error) {
      console.error("Error al calcular horas laborables:", error);
      message.error("Error al calcular las horas laborables");
    }
  };


  // Manejar cambios en el formulario
  const handleFormChange = (changedValues) => {
    const { hora_inicio, hora_fin, descuentoManana, descuentoTarde } =
      changedValues;
    if (
      hora_inicio ||
      hora_fin ||
      descuentoManana !== undefined ||
      descuentoTarde !== undefined
    ) {
      calcularHoras();
    }
  };

  useEffect(() => {
    if (show && registro) {
      form.setFieldsValue({
        usuario_id: registro.Usuario ? registro.Usuario.id : null,
        actividad_id: registro.Actividad ? registro.Actividad.id : null,
        subactividades_id: registro.Subactividades
          ? registro.Subactividades.map((sub) => sub.id)
          : [],
        seccion_id: registro.Seccion ? registro.Seccion.id : null,
        lote_ids: registro.Lotes ? registro.Lotes.map((lote) => lote.id) : [],
        rendimiento: registro.rendimiento ? formatRendimiento(registro.rendimiento) : "",
        unidad_medida: registro.unidad_medida || "",
        fecha: registro.fecha || "",
        hora_inicio: registro.hora_inicio || "",
        hora_fin: registro.hora_fin || "",
        descuentoManana: registro.descuentoManana || false,
        descuentoTarde: registro.descuentoTarde || false,
        horas_labor: registro.horas_labor || "",


        horas_lluvia: registro.horas_lluvia
          ? (registro.horas_lluvia * 60).toFixed(0)
          : "",
        horas_traslado: registro.horas_traslado
          ? (registro.horas_traslado * 60).toFixed(0)
          : "",
        horas_recoleccion: registro.horas_recoleccion
          ? (registro.horas_recoleccion * 60).toFixed(0)
          : "",


          
        cantidad_arboles_aplicados: registro.cantidad_arboles_aplicados || 0,
        cantidad_litros_aplicados: registro.cantidad_litros_aplicados || 0,
        cantidad_arboles_fertilizados:
          registro.cantidad_arboles_fertilizados || 0,
        cantidad_kilos_aplicados: registro.cantidad_kilos_aplicados || 0,
        observaciones: registro.observaciones || "",
      });

      console.log("Valores del formulario:", form.getFieldsValue());


      if (registro.Actividad) {
        setSelectedActividad(registro.Actividad.id);
        loadSubactividades(registro.Actividad.id, registro.Subactividades); // Modificación para incluir subactividades seleccionadas
      } else {
        setFilteredSubactividades([]);
      }

      if (registro.Seccion) {
        setSelectedSeccion(registro.Seccion.id);
        loadLotes(registro.Seccion.id);
      } else {
        setFilteredLotes([]);
      }
    } else {
      form.resetFields();
      setFilteredSubactividades([]);
      setFilteredLotes([]);
    }
  }, [show, registro]);

  const loadSubactividades = async (actividadId, selectedSubactividades = []) => {
    try {
      const subactividadesData = await getSubactividades(actividadId);

      // Combinar subactividades cargadas con las seleccionadas previamente
      const combinedSubactividades = subactividadesData.map((sub) => ({
        ...sub,
        selected: selectedSubactividades.some((s) => s.id === sub.id),
      }));

      console.log("Subactividades combinadas:", combinedSubactividades);
      setFilteredSubactividades(combinedSubactividades);
    } catch (error) {
      console.error("Error al cargar subactividades:", error);
      message.error("Error al cargar subactividades");
    }
  };


  const loadLotes = async (seccionId) => {
    try {
      const lotesData = await getLotes(seccionId);
      setFilteredLotes(lotesData);
    } catch (error) {
      console.error("Error al cargar lotes:", error);
      message.error("Error al cargar lotes");
    }
  };

  const handleActividadChange = (actividadId) => {
    setSelectedActividad(actividadId);
    form.setFieldsValue({ subactividades_id: [] });
    loadSubactividades(actividadId);
  };

  const handleSeccionChange = (seccionId) => {
    setSelectedSeccion(seccionId);
    form.setFieldsValue({ lote_ids: [] });
    loadLotes(seccionId);
  };

  const handleUpdate = async () => {  
    try {
      const values = await form.validateFields();

      const updateData = {
        id: registro.id,
        usuario_ids: [values.usuario_id],
        actividad_id: values.actividad_id,
        seccion_id: values.seccion_id,
        fecha: values.fecha,
        hora_inicio: values.hora_inicio,
        hora_fin: values.hora_fin,
        descuentoManana: values.descuentoManana || false,
        descuentoTarde: values.descuentoTarde || false,
        horas_labor: parseFloat(values.horas_labor) || 0,

        horas_lluvia: parseFloat(values.horas_lluvia) || 0,
        horas_traslado: parseFloat(values.horas_traslado) || 0,
        horas_recoleccion: parseFloat(values.horas_recoleccion) || 0,

        lote_ids: values.lote_ids?.map(Number) || [], // Manejo de valores vacíos
        subactividades_id: values.subactividades_id?.map(Number) || [],
        rendimiento:
          !isNaN(parseFloat(values.rendimiento)) &&
            selectedActividad !== 1 &&
            selectedActividad !== 2
            ? parseFloat(values.rendimiento)
            : 0, // Rendimiento es 0 si no aplica
        unidad_medida: selectedActividad === 1 || selectedActividad === 2 ? "" : values.unidad_medida || "",
        cantidad_arboles_aplicados: parseFloat(values.cantidad_arboles_aplicados) || 0,
        cantidad_litros_aplicados: parseFloat(values.cantidad_litros_aplicados) || 0,
        cantidad_arboles_fertilizados: parseFloat(values.cantidad_arboles_fertilizados) || 0,
        cantidad_kilos_aplicados: parseFloat(values.cantidad_kilos_aplicados) || 0,
        observaciones: values.observaciones || "",
      };

      console.log("Datos enviados al backend:", updateData);

      const response = await updateRegistro(updateData.id, updateData);
      message.success("Registro actualizado exitosamente");
      onSave();
      onHide();
    } catch (error) {
      console.error("Error al actualizar el registro:", error);
      message.error(
        `Error al actualizar el registro: ${error.response?.data?.message || error.message || "Error desconocido"
        }`
      );
    }
  };


  const handleDelete = async () => {
    try {
      await deleteRegistro(registro.id);
      message.success("Registro eliminado exitosamente");
      onSave();
      onHide();
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
      message.error("Error al eliminar el registro");
    }
  };

  return (
    <Modal
      open={show}
      onCancel={onHide}
      title="Editar o Eliminar Registro"
      footer={[
        <Button key="delete" type="primary" danger onClick={handleDelete}>
          Eliminar
        </Button>,
        <Button key="submit" type="primary" onClick={handleUpdate}>
          Guardar
        </Button>,
        <Button key="back" onClick={onHide}>
          Cancelar
        </Button>,
      ]}
    >
      {show && (
        <Form form={form} layout="vertical" onValuesChange={(changedValues) => handleFormChange(changedValues)}  >
          <Form.Item label="Fecha" name="fecha">
            <Input type="date" />


          </Form.Item>

          <Form.Item label="Operario" name="usuario_id">
            <Select placeholder="Seleccione un operario">
              {usuarios.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.nombre} {user.apellido}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Sección" name="seccion_id">
            <Select
              placeholder="Seleccione una sección"
              onChange={handleSeccionChange}
            >
              {secciones.map((seccion) => (
                <Select.Option key={seccion.id} value={seccion.id}>
                  {seccion.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {filteredLotes.length > 0 && (
            <Form.Item label="Lotes" name="lote_ids">
              <Select mode="multiple" placeholder="Seleccione lotes">
                {filteredLotes.map((lote) => (
                  <Select.Option key={lote.id} value={lote.id}>
                    {lote.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item label="Actividad" name="actividad_id">
            <Select
              placeholder="Seleccione una actividad"
              onChange={handleActividadChange}
            >
              {actividades.map((actividad) => (
                <Select.Option key={actividad.id} value={actividad.id}>
                  {actividad.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {filteredSubactividades.length > 0 && (
            <Form.Item label="Subactividades" name="subactividades_id">
              <Select
                mode="multiple"
                options={filteredSubactividades.map((sub) => ({
                  value: sub.id,
                  label: sub.nombre,
                }))}
                placeholder="Seleccione subactividades"
              />
            </Form.Item>
          )}

          {[1, 5].includes(selectedActividad) && (
            <>
              <Form.Item label="Cantidad Árboles Aplicados" name="cantidad_arboles_aplicados">
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Cantidad Litros Aplicados" name="cantidad_litros_aplicados">
                <Input type="number" />
              </Form.Item>
            </>
          )}

          {selectedActividad === 2 && (
            <>
              <Form.Item label="Cantidad Árboles Fertilizados" name="cantidad_arboles_fertilizados">
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Cantidad Kilos Aplicados" name="cantidad_kilos_aplicados">
                <Input type="number" />
              </Form.Item>
            </>
          )}


          {![1, 2, 5].includes(selectedActividad) && (
            <>
              <Form.Item
                label="Rendimiento"
                name="rendimiento"
                rules={[
                  {
                    required: ![1, 2].includes(selectedActividad),
                    message: "Por favor ingresa un rendimiento válido.",
                  },
                  {
                    validator: (_, value) =>
                      !isNaN(value) && value >= 0
                        ? Promise.resolve()
                        : Promise.reject(
                          "El rendimiento debe ser un número válido."
                        ),
                  },
                ]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item label="Unidad de Medida" name="unidad_medida">
                <Select
                  placeholder="Seleccione una unidad de medida"
                  options={[
                    { value: "Hectáreas", label: "Hectáreas" },
                    { value: "Kilogramos", label: "Kilogramos" },
                    { value: "Litros", label: "Litros" },
                    { value: "Metros", label: "Metros" },
                    { value: "Unidad", label: "Unidad" },
                  ]}
                  onChange={(value) => {
                    form.setFieldsValue({ unidad_medida: value }); // Actualiza el formulario con el valor seleccionado
                  }}
                  value={form.getFieldValue("unidad_medida")} // Asegúrate de mostrar el valor actual del formulario
                />
              </Form.Item>
            </>
          )}

          <Form.Item label="Hora Inicio" name="hora_inicio">
            <Input type="time" />
          </Form.Item>

          <Form.Item label="Hora Fin" name="hora_fin">
            <Input type="time" />
          </Form.Item>

          <Form.Item name="descuentoManana" valuePropName="checked">
            <Checkbox>Descuento Pausa Activa Mañana (10:00 - 10:10)</Checkbox>
          </Form.Item>

          <Form.Item name="descuentoTarde" valuePropName="checked">
            <Checkbox>Descuento Pausa Activa Tarde (15:00 - 15:10)</Checkbox>
          </Form.Item>

          <Form.Item label="Horas Lluvia" name="horas_lluvia">
            <Input type="number" step="0.01" />
          </Form.Item>

          <Form.Item label="Horas Traslado" name="horas_traslado">
            <Input type="number" step="0.01" />
          </Form.Item>

          <Form.Item label="Horas Recolección" name="horas_recoleccion">
            <Input type="number" step="0.01" />
          </Form.Item>

          <Form.Item label="Observaciones" name="observaciones">
            <Input.TextArea />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default EditDeleteModal;