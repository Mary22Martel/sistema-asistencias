import express from "express";
import fs from "fs";
import { procesarExcel, registrarAsistencias } from "../controladores/asistencia.controlador.js";
import multer from "multer";
import conexion from "../configuracion/basedatos.js";

const router = express.Router();
const subirArchivo = multer({ dest: "uploads/" });

router.post("/subir", subirArchivo.single("excel"), async (req, res) => {
  try {
    const datos = await procesarExcel(req.file.path);
    const resultados = await registrarAsistencias(datos);
    fs.unlinkSync(req.file.path);

    res.json({
      mensaje: "Archivo procesado correctamente",
      datos: resultados,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/usuario/:id", async (req, res) => {
  try {
    // Obtener el usuario con CAST a número
    const [usuario] = await conexion.query(
      "SELECT nombre, CAST(sueldo AS DECIMAL(10,2)) AS sueldo FROM usuarios WHERE id = ?",
      [req.params.id]
    );

    if (!usuario.length) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Obtener asistencias con descuentos convertidos a número
    const [asistencias] = await conexion.query(
      `SELECT DATE(fecha_hora) as fecha, 
              CAST(COALESCE(descuento, 0) AS DECIMAL(10,2)) as descuento, 
              turno, 
              TIME(fecha_hora) as hora_entrada
       FROM asistencias 
       WHERE usuario_id = ? 
       ORDER BY fecha_hora ASC`,
      [req.params.id]
    );

    // Si el usuario no tiene asistencias, evitar cálculos incorrectos
    const totalDescuentos = asistencias.reduce((acc, dia) => acc + parseFloat(dia.descuento), 0);

    // Convertir sueldo a número y calcular sueldo neto
    const sueldoBase = parseFloat(usuario[0].sueldo);
    const sueldoNeto = sueldoBase - totalDescuentos;

    res.json({
      usuario: {
        nombre: usuario[0].nombre,
        sueldo_base: sueldoBase,
        sueldo_neto: sueldoNeto,
      },
      asistencias,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
