import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

// Convertir import.meta.url en __dirname (compatible con ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function leerExcel(rutaArchivo, idUsuario) {
    try {
        // Leer el archivo
        const workbook = xlsx.readFile(rutaArchivo);
        const sheetName = workbook.SheetNames[0]; // Tomar la primera hoja
        const worksheet = workbook.Sheets[sheetName];

        // Convertir a JSON
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Filtrar por ID de usuario
        const resultados = data.filter(row => row['ID de Usuario'] == idUsuario)
            .map(row => ({
                tiempo: row['Tiempo'],
                idUsuario: row['ID de Usuario'],
                nombre: row['Nombre']
            }));

        return resultados;
    } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
        return [];
    }
}

// Ruta del archivo Excel (ajústala según tu entorno)
const rutaArchivo = path.join(__dirname, '../../uploads/hoy.xls');

// Prueba con ID de usuario 2
console.log(leerExcel(rutaArchivo, 2));
