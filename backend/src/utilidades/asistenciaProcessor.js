import moment from 'moment';

// Configuración del horario laboral
const HORARIO_MANANA = { inicio: "08:30", tolerancia: "08:38", descuento_1: "08:39", descuento_2: "09:31", ausencia: "10:31" };
const HORARIO_TARDE = { inicio: "15:00", tolerancia: "15:08", descuento_1: "15:09", descuento_2: "16:31", ausencia: "17:31" };
const HORARIO_SABADO = { inicio: "08:30", tolerancia: "08:38", descuento_1: "08:39", descuento_2: "09:31", ausencia: "10:31" };

// Descuentos monetarios
const DESCUENTO_1 = 5;  // 8:39 - 9:30 (mañana) | 15:09 - 16:30 (tarde)
const DESCUENTO_2 = 10; // 9:31 - 10:30 (mañana) | 16:31 - 17:30 (tarde)

// Salario base y cálculo por día
const SALARIO_MENSUAL = 1500;
const DIAS_LABORALES = 30; // Ajustar según sea necesario
const SALARIO_DIARIO = SALARIO_MENSUAL / DIAS_LABORALES;
const DESCUENTO_AUSENCIA = SALARIO_DIARIO / 2; // Mitad del día

function procesarAsistencias(registros, fechaInicio, fechaFin) {
    const asistencias = {};

    registros.forEach(registro => {
        let [fecha, hora] = registro.tiempo.split(" ");
        let idUsuario = registro.idUsuario;
        
        if (!asistencias[idUsuario]) asistencias[idUsuario] = {};

        if (!asistencias[idUsuario][fecha]) {
            asistencias[idUsuario][fecha] = {
                entradas: [],
                salidas: [],
                descuentos: 0,
                ausencia: false,
                detalles: [],
            };
        }

        let horaMomento = moment(hora, "HH:mm:ss");
        let diaSemana = moment(fecha).isoWeekday(); // 1 = lunes, 7 = domingo
        let horario = (diaSemana === 6) ? HORARIO_SABADO : HORARIO_MANANA;
        let horarioTarde = HORARIO_TARDE;

        // Determinar si es entrada o salida
        if (horaMomento.isBefore(moment(horario.inicio, "HH:mm"))) {
            asistencias[idUsuario][fecha].entradas.push(hora);
        } else if (horaMomento.isBetween(moment(horario.inicio, "HH:mm"), moment("14:00", "HH:mm"))) {
            asistencias[idUsuario][fecha].entradas.push(hora);
        } else {
            asistencias[idUsuario][fecha].salidas.push(hora);
        }
    });

    // Aplicar lógica de descuentos
    Object.keys(asistencias).forEach(idUsuario => {
        Object.keys(asistencias[idUsuario]).forEach(fecha => {
            let asistencia = asistencias[idUsuario][fecha];
            let entradas = asistencia.entradas.sort();
            let salidas = asistencia.salidas.sort();

            if (entradas.length > 0) {
                let entradaMañana = moment(entradas[0], "HH:mm:ss");
                let horario = HORARIO_MANANA;
                
                if (entradaMañana.isAfter(moment(horario.tolerancia, "HH:mm"))) {
                    if (entradaMañana.isBetween(moment(horario.descuento_1, "HH:mm"), moment(horario.descuento_2, "HH:mm"))) {
                        asistencia.descuentos += DESCUENTO_1;
                        asistencia.detalles.push(`Llegó tarde (${entradaMañana.format("HH:mm")}), descuento de S/. ${DESCUENTO_1}`);
                    } else if (entradaMañana.isAfter(moment(horario.descuento_2, "HH:mm"))) {
                        asistencia.descuentos += DESCUENTO_2;
                        asistencia.detalles.push(`Llegó muy tarde (${entradaMañana.format("HH:mm")}), descuento de S/. ${DESCUENTO_2}`);
                    }
                }
            } else {
                asistencia.ausencia = true;
                asistencia.descuentos += DESCUENTO_AUSENCIA;
                asistencia.detalles.push(`Ausencia en la mañana, descuento de S/. ${DESCUENTO_AUSENCIA}`);
            }

            if (salidas.length > 0) {
                let salidaMañana = moment(salidas[0], "HH:mm:ss");
                if (salidaMañana.isBefore(moment("12:30", "HH:mm"))) {
                    let minutosAntes = moment.duration(moment("12:30", "HH:mm").diff(salidaMañana)).asMinutes();
                    asistencia.detalles.push(`Salió temprano (${salidaMañana.format("HH:mm")}), ${minutosAntes} minutos antes.`);
                }
            }
        });
    });

    return asistencias;
}

export { procesarAsistencias };
