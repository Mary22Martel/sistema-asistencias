import moment from 'moment';

const HORARIO = {
    mañana: { inicio: "08:30", tolerancia: "08:38", tardanza1: "08:39", tardanza2: "09:31", ausencia: "10:31" },
    tarde: { inicio: "15:00", tolerancia: "15:08", tardanza1: "15:09", tardanza2: "16:31", ausencia: "17:31" }
};

const DIAS_LABORALES = 30;

function procesarAsistencias(registros, fechaInicio, fechaFin, idUsuario, salarioMensual) {
    const asistencias = {};
    const salarioDiario = salarioMensual / DIAS_LABORALES;
    const descuentoPorHora = salarioDiario / 8;
    const descuentoMediaJornada = salarioDiario / 2;
    let totalDescuento = 0;

    registros.forEach(registro => {
        const [fecha, hora] = registro.Tiempo.split(" ");
        if (registro["ID de Usuario"] != idUsuario || moment(fecha).isBefore(fechaInicio) || moment(fecha).isAfter(fechaFin)) return;

        if (!asistencias[fecha]) {
            asistencias[fecha] = { 
                mañana: null, tarde: null, descuento: 0, 
                estadoM: "Presente", estadoT: "Presente",
                detalles: [] 
            };
        }

        const horaMomento = moment(hora, "HH:mm:ss");

        if (horaMomento.isBetween(moment(HORARIO.mañana.inicio, "HH:mm"), moment(HORARIO.mañana.ausencia, "HH:mm"))) {
            asistencias[fecha].mañana = hora;
        } else if (horaMomento.isBetween(moment(HORARIO.tarde.inicio, "HH:mm"), moment(HORARIO.tarde.ausencia, "HH:mm"))) {
            asistencias[fecha].tarde = hora;
        }
    });

    Object.keys(asistencias).forEach(fecha => {
        const asistencia = asistencias[fecha];

        // 📌 Verificación de la mañana
        if (!asistencia.mañana) {
            asistencia.estadoM = "Ausente";
            asistencia.descuento += descuentoMediaJornada;
            asistencia.detalles.push(`Ausente en la mañana - Descuento S/. ${descuentoMediaJornada.toFixed(2)}`);
        } else {
            const entradaMañana = moment(asistencia.mañana, "HH:mm:ss");
            if (entradaMañana.isBetween(moment(HORARIO.mañana.tardanza1, "HH:mm"), moment(HORARIO.mañana.tardanza2, "HH:mm"))) {
                asistencia.estadoM = "Tardanza";
                asistencia.descuento += 5;
                asistencia.detalles.push(`Llegó tarde en la mañana (${asistencia.mañana}) - Descuento S/. 5.00`);
            } else if (entradaMañana.isAfter(moment(HORARIO.mañana.tardanza2, "HH:mm"))) {
                asistencia.estadoM = "Tardanza grave";
                asistencia.descuento += 10;
                asistencia.detalles.push(`Llegó muy tarde en la mañana (${asistencia.mañana}) - Descuento S/. 10.00`);
            } else if (entradaMañana.isAfter(moment(HORARIO.mañana.ausencia, "HH:mm"))) {
                asistencia.estadoM = "Ausente";
                asistencia.descuento += descuentoMediaJornada;
                asistencia.detalles.push(`Llegó demasiado tarde (${asistencia.mañana}) - Se considera ausente en la mañana - Descuento S/. ${descuentoMediaJornada.toFixed(2)}`);
            }
        }

        // 📌 Verificación de la tarde
        if (!asistencia.tarde) {
            asistencia.estadoT = "Ausente";
            asistencia.descuento += descuentoMediaJornada;
            asistencia.detalles.push(`Ausente en la tarde - Descuento S/. ${descuentoMediaJornada.toFixed(2)}`);
        } else {
            const entradaTarde = moment(asistencia.tarde, "HH:mm:ss");
            if (entradaTarde.isBetween(moment(HORARIO.tarde.tardanza1, "HH:mm"), moment(HORARIO.tarde.tardanza2, "HH:mm"))) {
                asistencia.estadoT = "Tardanza";
                asistencia.descuento += 5;
                asistencia.detalles.push(`Llegó tarde en la tarde (${asistencia.tarde}) - Descuento S/. 5.00`);
            } else if (entradaTarde.isAfter(moment(HORARIO.tarde.tardanza2, "HH:mm"))) {
                asistencia.estadoT = "Tardanza grave";
                asistencia.descuento += 10;
                asistencia.detalles.push(`Llegó muy tarde en la tarde (${asistencia.tarde}) - Descuento S/. 10.00`);
            } else if (entradaTarde.isAfter(moment(HORARIO.tarde.ausencia, "HH:mm"))) {
                asistencia.estadoT = "Ausente";
                asistencia.descuento += descuentoMediaJornada;
                asistencia.detalles.push(`Llegó demasiado tarde (${asistencia.tarde}) - Se considera ausente en la tarde - Descuento S/. ${descuentoMediaJornada.toFixed(2)}`);
            }
        }

        totalDescuento += asistencia.descuento;
    });

    return { asistencias, totalPagar: salarioMensual - totalDescuento };
}

export { procesarAsistencias };
