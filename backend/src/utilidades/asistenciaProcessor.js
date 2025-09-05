// src/utilidades/procesarAsistencias.js
import moment from 'moment';

const HORARIO = {
  mañana: {
    inicio: "08:30",       // Hora oficial de inicio
    tolerancia: "08:38",   // Hasta esta hora no hay penalidad
    tardanza1Inicio: "08:39",
    tardanza1Fin:   "09:29", // Tardanza leve: S/. 5.00
    tardanza2Inicio: "09:30",
    tardanza2Fin:    "10:30", // Tardanza grave: S/. 10.00
    ausencia: "10:31",       // A partir de esta hora se considera ausencia (media jornada)
    salidaPermitida: "13:00" // Hora de salida de la mañana
  },
  tarde: {
    inicio: "15:00",
    tolerancia: "15:08",
    tardanza1Inicio: "15:09",
    tardanza1Fin:   "16:29", // Tardanza leve: S/. 5.00
    tardanza2Inicio: "16:30",
    tardanza2Fin:    "17:30", // Tardanza grave: S/. 10.00
    ausencia: "17:31",       // A partir de esta hora se considera ausencia (media jornada)
    salidaPermitida: "19:00" // Hora de salida de la tarde
  }
};

const DIAS_LABORALES = 30;

/**
 * Procesa los registros del Excel y genera un objeto 'asistencias' 
 * SOLO con los días que aparecen en el archivo.
 * No rellena los días sin marcas.
 *
 * @param {Array} registros - Array de registros extraídos del Excel.
 * @param {String} fechaInicio - Fecha de inicio del periodo (formato "YYYY-MM-DD").
 * @param {String} fechaFin - Fecha de fin del periodo (formato "YYYY-MM-DD").
 * @param {String|Number} idUsuario - ID del usuario para filtrar registros.
 * @param {Number} salarioMensual - Salario mensual del usuario.
 * @returns {Object} Objeto con { asistencias, totalPagar }
 */
function procesarAsistencias(registros, fechaInicio, fechaFin, idUsuario, salarioMensual) {
  const asistencias = {};
  const salarioDiario = salarioMensual / DIAS_LABORALES;
  const descuentoPorHora = salarioDiario / 8;
  const descuentoMediaJornada = salarioDiario / 2;
  let totalDescuento = 0;

  // 1) Ordenar los registros por fecha/hora
  registros.sort((a, b) => {
    const fechaA = moment(a.Tiempo, ["YYYY-MM-DD HH:mm:ss", "DD/MM/YYYY HH:mm:ss", "D/MM/YYYY HH:mm:ss"], true);
    const fechaB = moment(b.Tiempo, ["YYYY-MM-DD HH:mm:ss", "DD/MM/YYYY HH:mm:ss", "D/MM/YYYY HH:mm:ss"], true);
    return fechaA.valueOf() - fechaB.valueOf();
  });

  // 2) Recorrer registros y guardar ENTRADAS / SALIDAS para los días con marcas
  registros.forEach((registro, index) => {
    if (!registro.Tiempo || typeof registro.Tiempo !== 'string') {
      console.warn(`⚠ Registro inválido en fila ${index + 1}:`, registro);
      return;
    }
    let fechaHora = moment(registro.Tiempo, ["YYYY-MM-DD HH:mm:ss", "DD/MM/YYYY HH:mm:ss", "D/MM/YYYY HH:mm:ss"], true);
    if (!fechaHora.isValid()) {
      console.warn(`⚠ Formato incorrecto en fila ${index + 1}:`, registro.Tiempo);
      return;
    }
    const fecha = fechaHora.format("YYYY-MM-DD");
    const hora = fechaHora.format("HH:mm:ss");

    // Filtrar por ID y rango de fechas
    if (
      registro["ID de Usuario"] != idUsuario ||
      moment(fecha).isBefore(fechaInicio) ||
      moment(fecha).isAfter(fechaFin)
    ) {
      return;
    }

    // Crear el objeto si no existe
    if (!asistencias[fecha]) {
      asistencias[fecha] = {
        mañana: null,
        salidaMañana: null,
        tarde: null,
        salidaTarde: null,
        estadoM: "Presente",
        estadoT: "Presente",
        descuento: 0,
        detalles: []
      };
    }

    const horaMomento = moment(hora, "HH:mm:ss");

    // ► RANGO MAÑANA (08:00 a 14:00)
    if (
      horaMomento.isBetween(
        moment("08:00", "HH:mm"),
        moment("14:00", "HH:mm"),
        null,
        "[)"
      )
    ) {
      if (!asistencias[fecha].mañana) {
        asistencias[fecha].mañana = hora;
      } else if (!asistencias[fecha].salidaMañana) {
        const entradaM = moment(asistencias[fecha].mañana, "HH:mm:ss");
        if (horaMomento.isAfter(entradaM)) {
          asistencias[fecha].salidaMañana = hora;
        }
      }
    }
    // ► RANGO TARDE (14:45 a 23:59)
    else if (
      horaMomento.isBetween(
        moment("14:45", "HH:mm"),
        moment("23:59", "HH:mm"),
        null,
        "[)"
      )
    ) {
      if (!asistencias[fecha].tarde) {
        asistencias[fecha].tarde = hora;
      } else if (!asistencias[fecha].salidaTarde) {
        const entradaT = moment(asistencias[fecha].tarde, "HH:mm:ss");
        if (horaMomento.isAfter(entradaT)) {
          asistencias[fecha].salidaTarde = hora;
        }
      }
    }
  });

  // 3) Evaluar tardanzas, ausencias parciales y salidas anticipadas
  Object.keys(asistencias).forEach(fecha => {
    const asistencia = asistencias[fecha];
    const diaSemana = moment(fecha, "YYYY-MM-DD").day(); // 6 = sábado

    // A) Evaluación de la entrada en la mañana
    if (!asistencia.mañana) {
      // No hay marcación: se considera ausente en la mañana
      asistencia.estadoM = "Ausente";
      asistencia.descuento += descuentoMediaJornada;
      asistencia.detalles.push(
        `Ausente en la mañana - Descuento S/. ${descuentoMediaJornada.toFixed(2)}`
      );
    } else {
      const entradaMañana = moment(asistencia.mañana, "HH:mm:ss");
      // Si la primera marcación es después de las 13:00, se considera presente
      if (entradaMañana.isAfter(moment("13:00", "HH:mm"))) {
        asistencia.estadoM = "Presente";
        asistencia.detalles.push(
          `Marcación en la mañana posterior a las 13:00 (${asistencia.mañana}) - Se consideró Presente`
        );
      }
      // Si está dentro del período de tolerancia, se considera a tiempo sin penalidad
      else if (entradaMañana.isSameOrBefore(moment(HORARIO.mañana.tolerancia, "HH:mm"))) {
        // A tiempo, sin descuento
      }
      // Primera tardanza: entre 08:39 y 09:29
      else if (
        entradaMañana.isBetween(
          moment(HORARIO.mañana.tardanza1Inicio, "HH:mm"),
          moment(HORARIO.mañana.tardanza1Fin, "HH:mm"),
          null,
          "[]"
        )
      ) {
        asistencia.estadoM = "Tardanza";
        asistencia.descuento += 5;
        asistencia.detalles.push(
          `Llegó tarde en la mañana (${asistencia.mañana}) - Descuento S/. 5.00`
        );
      }
      // Segunda tardanza: entre 09:30 y 10:30
      else if (
        entradaMañana.isBetween(
          moment(HORARIO.mañana.tardanza2Inicio, "HH:mm"),
          moment(HORARIO.mañana.tardanza2Fin, "HH:mm"),
          null,
          "[]"
        )
      ) {
        asistencia.estadoM = "Tardanza grave";
        asistencia.descuento += 10;
        asistencia.detalles.push(
          `Llegó muy tarde en la mañana (${asistencia.mañana}) - Descuento S/. 10.00`
        );
      }
      // Si llega a las 10:31 o más, se marca como ausente
      else if (
        entradaMañana.isSameOrAfter(moment(HORARIO.mañana.ausencia, "HH:mm"))
      ) {
        asistencia.estadoM = "Ausente";
        asistencia.descuento += descuentoMediaJornada;
        asistencia.detalles.push(
          `Llegó después de las ${HORARIO.mañana.ausencia} (${asistencia.mañana}) - Se consideró Ausente - Descuento S/. ${descuentoMediaJornada.toFixed(2)}`
        );
      }
    }

    // B) Evaluación de la salida de la mañana
    if (asistencia.salidaMañana) {
      const salidaMañana = moment(asistencia.salidaMañana, "HH:mm:ss");
      const salidaPermitida = moment(HORARIO.mañana.salidaPermitida, "HH:mm");
      if (salidaMañana.isBefore(salidaPermitida)) {
        const minutosFaltantes = salidaPermitida.diff(salidaMañana, "minutes");
        if (minutosFaltantes >= 15) {
          asistencia.estadoM = "Salida anticipada";
        }
        if (minutosFaltantes > 5) {
          const descuento = (minutosFaltantes / 60) * descuentoPorHora;
          asistencia.descuento += descuento;
          asistencia.detalles.push(
            `Salió ${minutosFaltantes} min antes de las ${HORARIO.mañana.salidaPermitida} - Descuento S/. ${descuento.toFixed(2)}`
          );
        }
      }
    }

    // Si es sábado, solo se trabaja en la mañana
    if (diaSemana === 6) {
      asistencia.tarde = "No aplica";
      asistencia.salidaTarde = "No aplica";
      asistencia.estadoT = "No aplica";
    } else {
      // C) Evaluación de la entrada en la tarde
      if (!asistencia.tarde) {
        asistencia.estadoT = "Ausente";
        asistencia.descuento += descuentoMediaJornada;
        asistencia.detalles.push(
          `Ausente en la tarde - Descuento S/. ${descuentoMediaJornada.toFixed(2)}`
        );
      } else {
        const entradaTarde = moment(asistencia.tarde, "HH:mm:ss");
        // Si la primera marcación en la tarde es después de las 19:00, se considera presente
        if (entradaTarde.isAfter(moment("19:00", "HH:mm"))) {
          asistencia.estadoT = "Presente";
          asistencia.detalles.push(
            `Marcación en la tarde posterior a las 19:00 (${asistencia.tarde}) - Se consideró Presente`
          );
        }
        // Dentro de tolerancia: sin penalidad
        else if (entradaTarde.isSameOrBefore(moment(HORARIO.tarde.tolerancia, "HH:mm"))) {
          // A tiempo, sin descuento
        }
        // Primera tardanza: entre 15:09 y 16:29
        else if (
          entradaTarde.isBetween(
            moment(HORARIO.tarde.tardanza1Inicio, "HH:mm"),
            moment(HORARIO.tarde.tardanza1Fin, "HH:mm"),
            null,
            "[]"
          )
        ) {
          asistencia.estadoT = "Tardanza";
          asistencia.descuento += 5;
          asistencia.detalles.push(
            `Llegó tarde en la tarde (${asistencia.tarde}) - Descuento S/. 5.00`
          );
        }
        // Segunda tardanza: entre 16:30 y 17:30
        else if (
          entradaTarde.isBetween(
            moment(HORARIO.tarde.tardanza2Inicio, "HH:mm"),
            moment(HORARIO.tarde.tardanza2Fin, "HH:mm"),
            null,
            "[]"
          )
        ) {
          asistencia.estadoT = "Tardanza grave";
          asistencia.descuento += 10;
          asistencia.detalles.push(
            `Llegó muy tarde en la tarde (${asistencia.tarde}) - Descuento S/. 10.00`
          );
        }
        // Si llega a las 17:31 o más, se marca como ausente
        else if (
          entradaTarde.isSameOrAfter(moment(HORARIO.tarde.ausencia, "HH:mm"))
        ) {
          asistencia.estadoT = "Ausente";
          asistencia.descuento += descuentoMediaJornada;
          asistencia.detalles.push(
            `Llegó después de las ${HORARIO.tarde.ausencia} (${asistencia.tarde}) - Se consideró Ausente - Descuento S/. ${descuentoMediaJornada.toFixed(2)}`
          );
        }

        // D) Evaluación de la salida en la tarde
        if (asistencia.salidaTarde) {
          const salidaTarde = moment(asistencia.salidaTarde, "HH:mm:ss");
          const salidaPermitidaTarde = moment(HORARIO.tarde.salidaPermitida, "HH:mm");
          if (salidaTarde.isBefore(salidaPermitidaTarde)) {
            const minutosFaltantes = salidaPermitidaTarde.diff(salidaTarde, "minutes");
            if (minutosFaltantes > 5) {
              const descuento = (minutosFaltantes / 60) * descuentoPorHora;
              asistencia.descuento += descuento;
              asistencia.detalles.push(
                `Salió ${minutosFaltantes} min antes de las ${HORARIO.tarde.salidaPermitida} - Descuento S/. ${descuento.toFixed(2)}`
              );
            }
          }
        }
      }
    }

    totalDescuento += asistencia.descuento;
  });

  // 4) Retornar sólo los días con marcas
  return {
    asistencias,
    totalPagar: salarioMensual - totalDescuento
  };
}

export { procesarAsistencias };
