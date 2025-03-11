import XLSX from "xlsx";
import conexion from "../configuracion/basedatos.js";
import { calcularDescuento } from "../utilidades/calcularDescuentos.js";

export const procesarExcel = async (archivoPath) => {
  const workbook = XLSX.readFile(archivoPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(worksheet);
};

export const registrarAsistencias = async (datos) => {
    const resultados = [];
    const registrosProcesados = new Set(); // Para evitar duplicados
  
    for (const fila of datos) {
      const usuarioId = fila["ID de Usuario"];
      const fechaHora = new Date(fila.Tiempo);
      const horaMarcacion = fechaHora.getHours();
      const minutosMarcacion = fechaHora.getMinutes();
      let tipoEvento = "";
      let turno = "";
  
      // 🔹 Verificar si el usuario existe
      const [usuarioExiste] = await conexion.query(
        "SELECT id FROM usuarios WHERE id = ?",
        [usuarioId]
      );
  
      if (usuarioExiste.length === 0) {
        console.log(`⚠ ERROR: Usuario con ID ${usuarioId} no existe. Omitiendo...`);
        continue;
      }
  
      // 🔹 Determinar si es entrada o salida correctamente
      if ((horaMarcacion === 8 && minutosMarcacion >= 30) || (horaMarcacion >= 9 && horaMarcacion < 13)) {
        turno = "mañana";
        tipoEvento = "entrada";
      } else if (horaMarcacion >= 13 && horaMarcacion < 14) {
        turno = "mañana";
        tipoEvento = "salida";
      } else if (horaMarcacion >= 15 && horaMarcacion < 19) {
        turno = "tarde";
        tipoEvento = "entrada";
      } else if (horaMarcacion >= 19) {
        turno = "tarde";
        tipoEvento = "salida";
      } else {
        turno = "mañana";
        tipoEvento = "salida"; // Fuera de horario laboral
      }
  
      // 🔹 Evitar registros duplicados en la misma fecha y hora
      const key = `${usuarioId}-${fila.Tiempo}`;
      if (registrosProcesados.has(key)) {
        console.log(`⏩ Registro duplicado para usuario ${usuarioId} en ${fila.Tiempo}, omitiendo...`);
        continue;
      }
      registrosProcesados.add(key);
  
      // 🔹 Aplicar descuento si es entrada tardía
      let descuento = 0;
      if (tipoEvento === "entrada") {
        descuento = calcularDescuento(fechaHora, turno);
      }
  
      // 🔹 Insertar en la BD
      await conexion.query(
        "INSERT INTO asistencias (usuario_id, fecha_hora, tipo_evento, turno, descuento) VALUES (?, ?, ?, ?, ?)",
        [usuarioId, fila.Tiempo, tipoEvento, turno, descuento]
      );
  
      resultados.push({
        usuario_id: usuarioId,
        fecha: fila.Tiempo,
        tipo_evento: tipoEvento,
        turno,
        descuento,
      });
    }
  
    return resultados;
  };
  
  
