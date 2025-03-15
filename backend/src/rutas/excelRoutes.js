// backend/src/rutas/excelRoutes.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';
import { procesarAsistencias } from '../utilidades/asistenciaProcessor.js';
import { leerExcel } from '../utilidades/excelProcessor.js';

const router = express.Router();

// Convertir import.meta.url en __dirname (compatible con ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/filtrar', (req, res) => {
  let { idUsuario, salario, fechaInicio, fechaFin } = req.body;

  if (!idUsuario || !salario || !fechaInicio || !fechaFin) {
    return res.status(400).json({
      mensaje: 'Todos los campos son obligatorios (idUsuario, salario, fechaInicio, fechaFin)'
    });
  }

  // Asegurarnos de que fechaInicio y fechaFin estén en formato "YYYY-MM-DD"
  const fInicio = moment(fechaInicio, ["YYYY-MM-DD", "DD/MM/YYYY"], true);
  const fFin = moment(fechaFin, ["YYYY-MM-DD", "DD/MM/YYYY"], true);

  if (!fInicio.isValid() || !fFin.isValid()) {
    return res.status(400).json({
      mensaje: 'Las fechas deben tener un formato válido (YYYY-MM-DD o DD/MM/YYYY).'
    });
  }

  // Reemplazamos las variables con el formato unificado
  fechaInicio = fInicio.format("YYYY-MM-DD");
  fechaFin = fFin.format("YYYY-MM-DD");

  // Construir la ruta al archivo Excel (ajusta si es necesario)
  const rutaArchivo = path.join(__dirname, '../../uploads/hoy.xls');

  // Leer los registros del Excel, filtrando por idUsuario
  const registros = leerExcel(rutaArchivo, idUsuario);

  // (Opcional) Ver en consola qué fechas se leyeron realmente
  console.log("Registros leídos del Excel:", registros);

  // Procesar las asistencias usando los registros obtenidos
  const resultados = procesarAsistencias(
    registros,
    fechaInicio,
    fechaFin,
    idUsuario,
    parseFloat(salario)
  );

  // Ver en consola para depurar
  console.log("Resultados de procesarAsistencias:", resultados);

  return res.json(resultados);
});

export default router;
