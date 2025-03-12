import express from 'express';
import { procesarAsistencias } from '../utilidades/asistenciaProcessor.js';
import { leerExcel } from '../utilidades/excelProcessor.js';

const router = express.Router();

router.post('/filtrar', (req, res) => {
    const { idUsuario, salario, fechaInicio, fechaFin } = req.body;

    if (!idUsuario || !salario || !fechaInicio || !fechaFin) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const registros = leerExcel('../../uploads/hoy.xls', idUsuario);
    const resultados = procesarAsistencias(registros, fechaInicio, fechaFin, idUsuario, parseFloat(salario));

    res.json(resultados);
});

export default router;
