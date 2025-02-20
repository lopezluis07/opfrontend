/** validations.js
 * 
 * Valida si un campo está vacío
 * @param {string} value - El valor del campo a validar.
 * @returns {boolean} - Retorna true si el valor no está vacío.
 */
export const isNotEmpty = (value) => value && value.trim() !== '';

/**
 * Valida si una fecha es válida
 * @param {string} value - El valor del campo de fecha.
 * @returns {boolean} - Retorna true si es una fecha válida.
 */
export const isValidDate = (value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
};

/**
 * Aplica clases de validación de Bootstrap a un campo
 * @param {HTMLElement} field - El campo HTML a validar.
 * @param {boolean} isValid - Si el campo es válido o no.
 */
export const applyValidationClass = (field, isValid) => {
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
    }
};

/**
 * Muestra un mensaje de feedback de validación
 * @param {HTMLElement} field - El campo HTML a validar.
 * @param {string} feedbackId - El ID del contenedor de feedback.
 * @param {boolean} isValid - Si el campo es válido o no.
 * @param {string} message - El mensaje de error en caso de que sea inválido.
 */
export const showValidationFeedback = (field, feedbackId, isValid, message) => {
    const feedbackElement = document.getElementById(feedbackId);
    if (isValid) {
        feedbackElement.textContent = '';
    } else {
        feedbackElement.textContent = message;
    }
};
