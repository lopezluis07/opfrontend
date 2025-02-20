import React from "react";
import Form from "react-bootstrap/Form";

const PausasActivasCheckboxes = ({
  descuentoManana,
  descuentoTarde,
  onChange,
  horaInicio,
  horaFin,
}) => {
  // Función para convertir horas (HH:mm) a minutos desde la medianoche
  const convertirHoraAMinutos = (hora) => {
    const [horas, minutos] = hora.split(":").map(Number);
    return horas * 60 + minutos;
  };

  const horaInicioMin = convertirHoraAMinutos(horaInicio);
  const horaFinMin = convertirHoraAMinutos(horaFin);


  // Definir los rangos de las pausas activas en minutos
  const pausaManana = { inicio: 10 * 60, fin: 10 * 60 + 10 }; // 10:00 - 10:10
  const pausaTarde = { inicio: 15 * 60, fin: 15 * 60 + 10 }; // 15:00 - 15:10

  // Evaluar si las pausas están dentro del rango del horario
  const mostrarPausaManana =
    horaFinMin >= pausaManana.inicio && horaInicioMin <= pausaManana.fin;
  const mostrarPausaTarde =
    horaFinMin >= pausaTarde.inicio && horaInicioMin <= pausaTarde.fin;

  return (
    <div>
      {/* Checkbox para la pausa activa de la mañana */}
      {mostrarPausaManana && (
        <div className="checkbox-group">
        <Form.Group>
          <Form.Check
            type="checkbox"
            id="descuentoManana"
            label="Descuento Pausa Activa Mañana (10:00 - 10:10)"
            name="descuentoManana"
            checked={descuentoManana} // Controlado por props
            onChange={(e) => {
              onChange(e); // Llamar al handler del formulario
            }}
          />
        </Form.Group> 
        </div>  
      )}

      {/* Checkbox para la pausa activa de la tarde */}
      {mostrarPausaTarde && (
        <div className="checkbox-group">
        <Form.Group>
          <Form.Check
            type="checkbox"
            id="descuentoTarde"
            label="Descuento Pausa Activa Tarde (15:00 - 15:10)"
            name="descuentoTarde"
            checked={descuentoTarde} // Controlado por props
            onChange={(e) => {
              onChange(e); // Llamar al handler del formulario
            }}
          />
        </Form.Group>
        </div>
      )}
    </div>
  );
};

export default PausasActivasCheckboxes;
