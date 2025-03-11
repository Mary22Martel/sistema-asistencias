import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const router = express.Router();

// Configurar almacenamiento de multer
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: path.join(__dirname, '../../uploads') });

// Endpoint para subir el archivo
router.post('/subir-excel', upload.single('archivo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ mensaje: 'No se ha subido ningún archivo' });
        }

        // Obtener la ruta del archivo subido
        const rutaArchivo = req.file.path;
        const workbook = xlsx.readFile(rutaArchivo);
        const sheetName = workbook.SheetNames[0]; // Tomar la primera hoja
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Filtrar solo los datos que queremos
        const resultados = data.map(row => ({
            tiempo: row['Tiempo'],
            idUsuario: row['ID de Usuario'],
            nombre: row['Nombre']
        }));

        res.json(resultados);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al procesar el archivo', error });
    }
});

export default router;
