import moment from 'moment';

const HORARIO = {
  mañana: {
    inicio: "08:30",
    tolerancia: "08:38",
    tardanza1: "08:39",
    tardanza2: "09:31",
    ausencia: "10:31",
    salidaPermitida: "13:00" // Hora oficial de salida de la mañana
  },
  tarde: {
    inicio: "15:00",
    tolerancia: "15:08",
    tardanza1: "15:09",
    tardanza2: "16:30",
    ausencia: "17:31",
    salidaPermitida: "19:00" // Hora oficial de salida de la tarde
  }
};

const DIAS_LABORALES = 30;

function procesarAsistencias(registros, fechaInicio, fechaFin, idUsuario, salarioMensual) {
  const asistencias = {};
  const salarioDiario = salarioMensual / DIAS_LABORALES;
  const descuentoPorHora = salarioDiario / 8;
  const descuentoMediaJornada = salarioDiario / 2;
  let totalDescuento = 0;

  // 1) ORDENAR LOS REGISTROS POR FECHA/HORA
  registros.sort((a, b) => {
    const fechaA = moment(a.Tiempo, ["YYYY-MM-DD HH:mm:ss", "DD/MM/YYYY HH:mm:ss", "D/MM/YYYY HH:mm:ss"], true);
    const fechaB = moment(b.Tiempo, ["YYYY-MM-DD HH:mm:ss", "DD/MM/YYYY HH:mm:ss", "D/MM/YYYY HH:mm:ss"], true);
    return fechaA.valueOf() - fechaB.valueOf(); // Ascendente
  });

  // 2) RECORRER REGISTROS Y GUARDAR ENTRADAS / SALIDAS
  registros.forEach((registro, index) => {
    // Validar que el campo "Tiempo" sea una fecha-hora válida
    if (!registro.Tiempo || typeof registro.Tiempo !== 'string') {
      console.warn(`⚠ Registro inválido en fila ${index + 1}:`, registro);
      return;
    }
    let fechaHora = moment(
      registro.Tiempo,
      ["YYYY-MM-DD HH:mm:ss", "DD/MM/YYYY HH:mm:ss", "D/MM/YYYY HH:mm:ss"],
      true
    );
    if (!fechaHora.isValid()) {
      console.warn(`⚠ Formato incorrecto en fila ${index + 1}:`, registro.Tiempo);
      return;
    }

    const fecha = fechaHora.format("YYYY-MM-DD");
    const hora = fechaHora.format("HH:mm:ss");

    // Filtrar por ID de usuario y rango de fechas
    if (
      registro["ID de Usuario"] != idUsuario ||
      moment(fecha).isBefore(fechaInicio) ||
      moment(fecha).isAfter(fechaFin)
    ) {
      return;
    }

    // Inicializar objeto de asistencia para esta fecha si no existe
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

    // ► AMPLIAR RANGO DE LA MAÑANA (por ejemplo, de 08:00 a 14:00)
    if (
      horaMomento.isBetween(
        moment("08:00", "HH:mm"), 
        moment("14:00", "HH:mm"), // <--- Ajusta si quieres hasta las 15:00
        null, 
        "[)"
      )
    ) {
      if (!asistencias[fecha].mañana) {
        // Primera marca => entrada
        asistencias[fecha].mañana = hora;
      } else if (!asistencias[fecha].salidaMañana) {
        // Verificamos que sea posterior a la entrada
        const entradaM = moment(asistencias[fecha].mañana, "HH:mm:ss");
        if (horaMomento.isAfter(entradaM)) {
          asistencias[fecha].salidaMañana = hora;
        }
      }
    }
    // ► AMPLIAR RANGO DE LA TARDE (por ejemplo, de 14:00 a 23:59)
    else if (
      horaMomento.isBetween(
        moment("14:45", "HH:mm"),
        moment("23:59", "HH:mm"), 
        null, 
        "[)"
      )
    ) {
      if (!asistencias[fecha].tarde) {
        // Primera marca => entrada
        asistencias[fecha].tarde = hora;
      } else if (!asistencias[fecha].salidaTarde) {
        const entradaT = moment(asistencias[fecha].tarde, "HH:mm:ss");
        if (horaMomento.isAfter(entradaT)) {
          asistencias[fecha].salidaTarde = hora;
        }
      }
    }
  });

  // 3) EVALUAR TARDANZAS, AUSENCIAS, SALIDAS ANTICIPADAS, ETC.
  Object.keys(asistencias).forEach(fecha => {
    const asistencia = asistencias[fecha];

    // A) Entrada en la mañana
    if (!asistencia.mañana) {
      asistencia.estadoM = "Ausente";
      asistencia.descuento += descuentoMediaJornada;
      asistencia.detalles.push(
        `Ausente en la mañana - Descuento S/. ${descuentoMediaJornada.toFixed(2)}`
      );
    } else {
      const entradaMañana = moment(asistencia.mañana, "HH:mm:ss");
      // Tardanza leve
      if (
        entradaMañana.isBetween(
          moment(HORARIO.mañana.tardanza1, "HH:mm"),
          moment(HORARIO.mañana.tardanza2, "HH:mm")
        )
      ) {
        asistencia.estadoM = "Tardanza";
        asistencia.descuento += 5;
        asistencia.detalles.push(
          `Llegó tarde en la mañana (${asistencia.mañana}) - Descuento S/. 5.00`
        );
      }
      // Tardanza grave
      else if (
        entradaMañana.isAfter(moment(HORARIO.mañana.tardanza2, "HH:mm"))
      ) {
        asistencia.estadoM = "Tardanza grave";
        asistencia.descuento += 10;
        asistencia.detalles.push(
          `Llegó muy tarde en la mañana (${asistencia.mañana}) - Descuento S/. 10.00`
        );
      }
    }

    // B) Salida en la mañana
    if (asistencia.salidaMañana) {
      let salidaMañana = moment(asistencia.salidaMañana, "HH:mm:ss");
      let salidaPermitida = moment(HORARIO.mañana.salidaPermitida, "HH:mm"); // 13:00
      if (salidaMañana.isBefore(salidaPermitida)) {
        // Salida antes de la hora oficial
        let minutosFaltantes = salidaPermitida.diff(salidaMañana, "minutes");
        if (minutosFaltantes >= 15) {
          asistencia.estadoM = "Salida anticipada";
        }
        if (minutosFaltantes > 5) {
          let descuento = (minutosFaltantes / 60) * descuentoPorHora;
          asistencia.descuento += descuento;
          asistencia.detalles.push(
            `Salió ${minutosFaltantes} min antes de las 13:00 - Descuento S/. ${descuento.toFixed(2)}`
          );
        }
      }
      else if (salidaMañana.isAfter(salidaPermitida)) {
        // Salió después de la hora permitida
        // Aquí podrías poner lógica adicional si deseas penalizar o no
      }
    }

    // C) Entrada en la tarde
    if (!asistencia.tarde) {
      asistencia.estadoT = "Ausente";
      asistencia.descuento += descuentoMediaJornada;
      asistencia.detalles.push(
        `Ausente en la tarde - Descuento S/. ${descuentoMediaJornada.toFixed(2)}`
      );
    } else {
      const entradaTarde = moment(asistencia.tarde, "HH:mm:ss");
      // Tardanza leve
      if (
        entradaTarde.isBetween(
          moment(HORARIO.tarde.tardanza1, "HH:mm"),
          moment(HORARIO.tarde.tardanza2, "HH:mm")
        )
      ) {
        asistencia.estadoT = "Tardanza";
        asistencia.descuento += 5;
        asistencia.detalles.push(
          `Llegó tarde en la tarde (${asistencia.tarde}) - Descuento S/. 5.00`
        );
      }
      // Tardanza grave
      else if (
        entradaTarde.isAfter(moment(HORARIO.tarde.tardanza2, "HH:mm"))
      ) {
        asistencia.estadoT = "Tardanza grave";
        asistencia.descuento += 10;
        asistencia.detalles.push(
          `Llegó muy tarde en la tarde (${asistencia.tarde}) - Descuento S/. 10.00`
        );
      }
    }

    // D) Salida en la tarde
    if (asistencia.salidaTarde) {
      let salidaTarde = moment(asistencia.salidaTarde, "HH:mm:ss");
      let salidaPermitidaTarde = moment(HORARIO.tarde.salidaPermitida, "HH:mm"); // 19:00
      if (salidaTarde.isBefore(salidaPermitidaTarde)) {
        let minutosFaltantes = salidaPermitidaTarde.diff(salidaTarde, "minutes");
        if (minutosFaltantes > 5) {
          let descuento = (minutosFaltantes / 60) * descuentoPorHora;
          asistencia.descuento += descuento;
          asistencia.detalles.push(
            `Salió ${minutosFaltantes} min antes de las 19:00 - Descuento S/. ${descuento.toFixed(2)}`
          );
        }
      } else if (salidaTarde.isAfter(salidaPermitidaTarde)) {
        // Salió después de las 19:00
        // Aquí puedes poner otra lógica si lo deseas
      }
    }

    // Acumular descuento total
    totalDescuento += asistencia.descuento;
  });

  // 4) RETORNAR RESULTADO
  return {
    asistencias,
    totalPagar: salarioMensual - totalDescuento
  };
}

export { procesarAsistencias };
