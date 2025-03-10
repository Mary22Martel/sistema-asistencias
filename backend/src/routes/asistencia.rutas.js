import express from "express";
import conexion from "../configuracion/basedatos.js";

const router = express.Router();

// Obtener todas las asistencias
router.get("/", async (req, res) => {
  try {
    const [filas] = await conexion.query("SELECT * FROM asistencias");
    res.json(filas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;