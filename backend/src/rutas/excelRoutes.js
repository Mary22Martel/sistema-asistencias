import express from 'express';
import { leerExcel } from '../utilidades/excelProcessor.js'; // Importa con .js al final
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Convertir import.meta.url en __dirname (para rutas en ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/filtrar/:idUsuario', (req, res) => {
    const idUsuario = req.params.idUsuario;
    const rutaArchivo = path.join(__dirname, '../../uploads/hoy.xls');

    try {
        const datos = leerExcel(rutaArchivo, idUsuario);
        res.json(datos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al leer el archivo Excel', error });
    }
});

export default router; // Exportación en ES Modules
