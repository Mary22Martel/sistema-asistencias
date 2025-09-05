import express from 'express';
import { procesarDominical } from '../utilidades/procesarDominical.js';

const router = express.Router();

router.post('/procesar-dominical', (req, res) => {
  const { asistencias, fechaInicio, fechaFin, salarioMensual, opcionesDominical } = req.body;
  
  try {
    const resultado = procesarDominical(asistencias, fechaInicio, fechaFin, salarioMensual, opcionesDominical);
    res.json(resultado);
  } catch (error) {
    console.error("Error en procesar dominical:", error);
    res.status(500).json({ error: "Error al procesar dominical" });
  }
});

export default router;
