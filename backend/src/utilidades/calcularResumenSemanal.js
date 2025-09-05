import moment from 'moment';

/**
 * Agrupa las asistencias en “semanas” de 7 días a partir de fechaInicio,
 * y calcula cuántas tardanzas y ausencias hay en cada bloque semanal.
 *
 * @param {Object} asistencias - Objeto con claves "YYYY-MM-DD" y valores { estadoM, estadoT, ... }.
 * @param {String} fechaInicio - "YYYY-MM-DD"
 * @param {String} fechaFin - "YYYY-MM-DD"
 * @returns {Array} Array de objetos, uno por cada semana, con la forma:
 *   {
 *     weekNumber: number,
 *     rango: "YYYY-MM-DD al YYYY-MM-DD",
 *     tardanzasM: number,
 *     tardanzasT: number,
 *     ausencias: number
 *   }
 */
export function calcularResumenSemanal(asistencias, fechaInicio, fechaFin) {
  const results = [];
  let startWeek = moment(fechaInicio, "YYYY-MM-DD");
  const end = moment(fechaFin, "YYYY-MM-DD");
  let weekIndex = 1;

  while (startWeek.isSameOrBefore(end)) {
    // Fin de esta “semana” (7 días desde startWeek)
    let endWeek = moment(startWeek).add(6, 'days');
    // Si endWeek se pasa de fechaFin, la ajustamos
    if (endWeek.isAfter(end)) {
      endWeek = moment(end);
    }

    // Contadores
    let tardanzasM = 0;
    let tardanzasT = 0;
    let ausencias = 0;

    // Recorremos cada día de este bloque
    let current = moment(startWeek);
    while (current.isSameOrBefore(endWeek)) {
      const dateStr = current.format("YYYY-MM-DD");
      const data = asistencias[dateStr];
      if (data) {
        // Revisa la mañana
        if (data.estadoM) {
          if (data.estadoM.includes("Tardanza")) {
            tardanzasM++;
          }
          if (data.estadoM === "Ausente") {
            ausencias++;
          }
        }
        // Revisa la tarde
        if (data.estadoT) {
          if (data.estadoT.includes("Tardanza")) {
            tardanzasT++;
          }
          if (data.estadoT === "Ausente") {
            ausencias++;
          }
        }
      }
      current.add(1, 'days');
    }

    results.push({
      weekNumber: weekIndex,
      // Rango de la semana en formato legible
      rango: `${startWeek.format("YYYY-MM-DD")} al ${endWeek.format("YYYY-MM-DD")}`,
      tardanzasM,
      tardanzasT,
      ausencias
    });

    weekIndex++;
    // La siguiente “semana” empieza al día siguiente de endWeek
    startWeek = endWeek.add(1, 'day');
  }

  return results;
}
