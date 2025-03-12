import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { procesarAsistencias } from '../utilidades/asistenciaProcessor.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/subir-excel', upload.single('archivo'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ mensaje: 'No se ha subido ningún archivo' });

        const { idUsuario, salario, fechaInicio, fechaFin } = req.body;
        if (!idUsuario || !salario || !fechaInicio || !fechaFin) {
            return res.status(400).json({ mensaje: 'ID, salario y fechas son obligatorios' });
        }

        const salarioMensual = parseFloat(salario);
        if (isNaN(salarioMensual) || salarioMensual <= 0) {
            return res.status(400).json({ mensaje: 'Salario inválido' });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (!data.length) {
            return res.status(400).json({ mensaje: 'El archivo Excel está vacío o mal formateado.' });
        }

        const resultados = procesarAsistencias(data, fechaInicio, fechaFin, idUsuario, salarioMensual);
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al procesar el archivo', error: error.message });
    }
});

export default router;
