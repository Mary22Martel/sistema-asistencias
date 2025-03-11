import express from "express";
import cors from "cors";
import rutasAsistencia from "./rutas/asistencia.rutas.js";
import excelRoutes from './rutas/excelRoutes.js';
import uploadRoutes from './rutas/uploadRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Usar rutas
app.use("/api/asistencia", rutasAsistencia);
app.use('/api/excel', excelRoutes);
app.use('/api/upload', uploadRoutes);

const PUERTO = process.env.PUERTO || 4000;
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});