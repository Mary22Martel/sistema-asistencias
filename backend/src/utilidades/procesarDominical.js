// src/utilidades/procesarDominical.js
import moment from 'moment';

/**
 * Procesa la asistencia dominical agrupando los domingos por semana y calcula el descuento dominical
 * en base a la opción elegida para cada semana.
 *
 * @param {Object} asistencias - Objeto de asistencias ya procesado (clave: "YYYY-MM-DD", valor: objeto de asistencia).
 * @param {String} fechaInicio - Fecha de inicio del periodo (formato "YYYY-MM-DD").
 * @param {String} fechaFin - Fecha de fin del periodo (formato "YYYY-MM-DD").
 * @param {Number} salarioMensual - Salario mensual del usuario.
 * @param {Object} opcionesDominical - Objeto con opciones para cada semana, ej: { "2023-W06": true, "2023-W07": false }
 *        donde true significa aplicar descuento para la ausencia dominical y false significa pasar sin descuento.
 *
 * @returns {Object} Retorna un objeto con:
 *    - descuentoDominical: monto total a descontar por ausencias dominicales.
 *    - detalleDominical: array de strings con detalle por semana.
 */
function procesarDominical(asistencias, fechaInicio, fechaFin, salarioMensual, opcionesDominical) {
  // Calcula el salario diario (suponiendo que DIAS_LABORALES es 30)
  const DIAS_LABORALES = 30;
  const salarioDiario = salarioMensual / DIAS_LABORALES;
  
  // Agrupar los domingos del periodo por semana (usando formato ISO de semana)
  const semanas = {}; // Ej: { "2023-W06": ["2023-02-12"], "2023-W07": ["2023-02-19"] }
  
  let current = moment(fechaInicio);
  const end = moment(fechaFin);
  
  while (current.isSameOrBefore(end)) {
    // En moment, domingo es el día 0
    if (current.day() === 0) {
      const semanaKey = current.format("GGGG-[W]WW"); // ej: "2023-W06"
      if (!semanas[semanaKey]) {
        semanas[semanaKey] = [];
      }
      semanas[semanaKey].push(current.format("YYYY-MM-DD"));
    }
    current.add(1, 'days');
  }
  
  let totalDescuentoDominical = 0;
  const detalleDominical = [];
  
  // Recorrer cada semana y evaluar cada domingo
  for (const semana in semanas) {
    const domingos = semanas[semana];
    domingos.forEach(dia => {
      // Se asume que si NO hay registro en el objeto asistencias para ese domingo, se considera ausencia.
      // También, si la asistencia existe pero el estado de la mañana está en "Ausente" o se dejó vacío.
      const asistencia = asistencias[dia];
      let ausenteDominical = false;
      
      if (!asistencia || !asistencia.mañana || asistencia.estadoM === "Ausente") {
        ausenteDominical = true;
      }
      
      // Evaluar en base a la opción elegida para la semana (true: descontar, false: pasar)
      if (ausenteDominical && opcionesDominical[semana] === true) {
        totalDescuentoDominical += salarioDiario;
        detalleDominical.push(`Semana ${semana}: Se aplicó descuento de S/. ${salarioDiario.toFixed(2)} por ausencia dominical (${dia}).`);
      } else if (ausenteDominical && opcionesDominical[semana] === false) {
        detalleDominical.push(`Semana ${semana}: Ausencia dominical (${dia}) sin descuento.`);
      } else {
        detalleDominical.push(`Semana ${semana}: Asistencia dominical registrada (${dia}).`);
      }
    });
  }
  
  return {
    descuentoDominical: totalDescuentoDominical,
    detalleDominical
  };
}

export { procesarDominical };
