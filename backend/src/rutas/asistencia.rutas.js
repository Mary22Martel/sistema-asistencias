import express from "express";
import fs from "fs";
import { procesarExcel, registrarAsistencias } from "../controladores/asistencia.controlador.js";
import multer from "multer";
import conexion from "../configuracion/basedatos.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/subir", upload.single("excel"), async (req, res) => {
  try {
    const datos = await procesarExcel(req.file.path);
    const resultados = await registrarAsistencias(datos);
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      registros_procesados: resultados.length,
      detalles: resultados
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error en el servidor",
      detalle: error.message
    });
  }
});

router.get("/usuario/:id", async (req, res) => {
  try {
    // Obtener usuario
    const [usuario] = await conexion.query(
      `SELECT id, nombre, CAST(sueldo AS DECIMAL(10,2)) AS sueldo 
       FROM usuarios WHERE id = ?`,
      [req.params.id]
    );

    if (!usuario.length) return res.status(404).json({ error: "Usuario no encontrado" });

    // Obtener registros ORDENADOS
    const [registros] = await conexion.query(
      `SELECT 
          fecha_hora,
          tipo_evento,
          turno,
          CAST(descuento AS DECIMAL(10,2)) AS descuento,
          COALESCE(detalle, 'Sin detalles') AS detalle  -- ✅ Asegurar que detalle nunca sea NULL
       FROM asistencias 
       WHERE usuario_id = ?
       ORDER BY fecha_hora ASC`, 
      [req.params.id]
    );

    console.log("🔹 Registros enviados al frontend:", registros); // ✅ Verificar en consola que los detalles estén presentes

    const diasMap = new Map();
    
    registros.forEach(registro => {
      const fecha = new Date(registro.fecha_hora).toISOString().split('T')[0];
      if (!diasMap.has(fecha)) {
        diasMap.set(fecha, {
          fecha,
          registros: [],
          total_descuento: 0
        });
      }
      
      const dia = diasMap.get(fecha);
      dia.registros.push({
        ...registro,
        hora: new Date(registro.fecha_hora).toLocaleTimeString('es-PE')
      });
      dia.total_descuento += parseFloat(registro.descuento);
    });

    res.json({
      usuario: {
        ...usuario[0],
        sueldo: parseFloat(usuario[0].sueldo),
        total_descuento: Array.from(diasMap.values()).reduce((acc, dia) => acc + dia.total_descuento, 0)
      },
      dias: Array.from(diasMap.values())
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;