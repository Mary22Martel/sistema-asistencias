// src/utilidades/completarCalendario.js
import moment from 'moment';

/**
 * Genera un array con todas las fechas entre fechaInicio y fechaFin (incluyendo ambas).
 * Asegúrate de que fechaInicio y fechaFin estén en formato "YYYY-MM-DD" o "DD/MM/YYYY".
 */
function generarRangoFechas(fechaInicio, fechaFin) {
  const inicio = moment(fechaInicio.toString().trim(), ["YYYY-MM-DD", "DD/MM/YYYY"], true);
  const fin = moment(fechaFin.toString().trim(), ["YYYY-MM-DD", "DD/MM/YYYY"], true);

  if (!inicio.isValid() || !fin.isValid()) {
    throw new Error(`Fecha inválida. Recibido fechaInicio: "${fechaInicio}", fechaFin: "${fechaFin}". Asegúrate de que estén en formato "YYYY-MM-DD" o "DD/MM/YYYY".`);
  }
  
  if (inicio.isAfter(fin)) {
    throw new Error("La fecha de inicio es posterior a la fecha de fin.");
  }

  const fechas = [];
  const current = inicio.clone(); // Clonar para no modificar el objeto original

  while (!current.isAfter(fin)) {
    fechas.push(current.format("YYYY-MM-DD"));
    current.add(1, "day");
  }
  
  return fechas;
}

/**
 * Completa los días que NO estén en 'asistenciasParcial':
 * - Si es domingo => "Descanso" sin descuento.
 * - Si es día laborable => "Ausente" con descuento de 1 día (puedes cambiar la lógica).
 *
 * Retorna un nuevo objeto con la asistencia de TODOS los días,
 * y también te indica cuánto descuento extra se sumó.
 */
function completarDiasFaltantes(asistenciasParcial, fechaInicio, fechaFin, salarioMensual, diasLaborales = 30) {
  // Clonar para no mutar el objeto original
  const asistenciasCompletas = JSON.parse(JSON.stringify(asistenciasParcial));

  const salarioDiario = salarioMensual / diasLaborales;
  const descuentoDiaCompleto = salarioDiario;
  let totalDescuentoExtra = 0;

  const todasLasFechas = generarRangoFechas(fechaInicio, fechaFin);
  todasLasFechas.forEach((dia) => {
    if (!asistenciasCompletas[dia]) {
      // Día sin registro => creamos un objeto
      asistenciasCompletas[dia] = {
        mañana: null,
        salidaMañana: null,
        tarde: null,
        salidaTarde: null,
        estadoM: "",
        estadoT: "",
        descuento: 0,
        detalles: []
      };

      // Verificar si es domingo
      const dayOfWeek = moment(dia, "YYYY-MM-DD").day(); // 0 = Domingo
      if (dayOfWeek === 0) {
        // Domingo => Descanso
        asistenciasCompletas[dia].estadoM = "Descanso";
        asistenciasCompletas[dia].estadoT = "Descanso";
        asistenciasCompletas[dia].detalles.push("Domingo - No laborable");
      } else {
        // Día laborable => Ausente
        asistenciasCompletas[dia].estadoM = "Ausente";
        asistenciasCompletas[dia].estadoT = "Ausente";
        asistenciasCompletas[dia].descuento = descuentoDiaCompleto;
        asistenciasCompletas[dia].detalles.push("Ausencia completa - Descuento día completo");

        totalDescuentoExtra += descuentoDiaCompleto;
      }
    }
  });

  // Calcular el total de descuentos final (incluye lo que ya venía y lo nuevo)
  let totalDescuentoFinal = 0;
  Object.keys(asistenciasCompletas).forEach((fecha) => {
    totalDescuentoFinal += asistenciasCompletas[fecha].descuento;
  });

  return {
    asistencias: asistenciasCompletas,
    totalDescuentoExtra, // Descuento que se añadió por estos días ausentes
    totalDescuentoFinal  // Suma total de descuentos
  };
}

export { completarDiasFaltantes };
