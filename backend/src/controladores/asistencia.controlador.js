import XLSX from "xlsx";
import conexion from "../configuracion/basedatos.js";
import { calcularDescuento } from "../utilidades/calcularDescuentos.js";

const validarFecha = (fecha) => !isNaN(new Date(fecha).getTime());

export const procesarExcel = async (archivoPath) => {
  try {
    const workbook = XLSX.readFile(archivoPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log("🔹 Registros extraídos del Excel:", jsonData); // ✅ Verifica cuántos registros se están obteniendo

    return jsonData.filter(fila => fila["ID de Usuario"] && validarFecha(fila.Tiempo));
  } catch (error) {
    throw new Error(`Error al procesar archivo: ${error.message}`);
  }
};


export const registrarAsistencias = async (datos) => {
  const registrosUnicos = new Set();
  const resultados = [];

  // **Ordenar registros primero por fecha y hora**
  const datosOrdenados = [...datos].sort((a, b) => {
    return new Date(a.Tiempo) - new Date(b.Tiempo);
  });

  const registrosPorDia = new Map();

  for (const fila of datosOrdenados) {
    try {
      const usuarioId = fila["ID de Usuario"];
      const fechaHoraRaw = fila.Tiempo;
      const fechaHora = new Date(fechaHoraRaw);

      if (!usuarioId || isNaN(fechaHora)) {
        console.log(`Registro inválido: ${JSON.stringify(fila)}`);
        continue;
      }

      // **Obtener la fecha sin la hora**
      const fecha = fechaHora.toISOString().split('T')[0];

      // **Si no hay registros en el día, crear la entrada**
      if (!registrosPorDia.has(fecha)) {
        registrosPorDia.set(fecha, []);
      }

      const registrosDia = registrosPorDia.get(fecha);

      // **Determinar tipo de evento basado en el orden**
      let tipoEvento = "entrada";
      if (registrosDia.length > 0) {
        const ultimoRegistro = registrosDia[registrosDia.length - 1];
        tipoEvento = ultimoRegistro.tipoEvento === "entrada" ? "salida" : "entrada";
      }

      // **Determinar turno**
      let turno = "";
      const hora = fechaHora.getHours();
      if (hora < 13 || (hora === 13 && fechaHora.getMinutes() === 0)) {
        turno = "mañana";
      } else {
        turno = "tarde";
      }

      // **Si la salida es antes de una salida esperada, es salida anticipada**
      let detalle = "Normal";
      if (tipoEvento === "salida") {
        const ultimaEntrada = registrosDia.find(r => r.tipoEvento === "entrada");
        if (ultimaEntrada && fechaHora < new Date(ultimaEntrada.fechaHora)) {
          detalle = "Salida anticipada";
        }
      }

      // **Control de duplicados**
      const claveUnica = `${usuarioId}-${fechaHora.toISOString()}-${tipoEvento}-${turno}`;
      if (registrosUnicos.has(claveUnica)) continue;
      registrosUnicos.add(claveUnica);

      // **Verificar en la BD si ya existe**
      const [existente] = await conexion.query(
        `SELECT id FROM asistencias 
         WHERE usuario_id = ? 
         AND fecha_hora = STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')
         AND tipo_evento = ?
         AND turno = ?`,
        [usuarioId, fechaHoraRaw, tipoEvento, turno]
      );

      if (existente.length > 0) continue;

      // **Calcular descuento solo en entradas**
      const descuento = tipoEvento === "entrada" ? calcularDescuento(fechaHora, turno) : 0;

      // **Insertar en la BD**
      await conexion.query(
        `INSERT INTO asistencias 
         (usuario_id, fecha_hora, tipo_evento, turno, descuento, detalle)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [usuarioId, fechaHoraRaw, tipoEvento, turno, descuento, detalle]
      );

      const nuevoRegistro = {
        usuarioId,
        fechaHora: fechaHoraRaw,
        tipoEvento,
        turno,
        descuento,
        detalle,
        fecha
      };

      registrosDia.push(nuevoRegistro); // Agregar a la lista del día
      resultados.push(nuevoRegistro);

    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY') {
        console.error(`Error en registro: ${error.message}`);
      }
    }
  }

  return resultados;
};
