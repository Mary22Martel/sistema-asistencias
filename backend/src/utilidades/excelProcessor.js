import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment'; // Importar moment aquí

// Convertir import.meta.url en __dirname (compatible con ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function leerExcel(rutaArchivo, idUsuario) {
    try {
        // 📌 Leer el archivo Excel
        const workbook = xlsx.readFile(rutaArchivo);
        const sheetName = workbook.SheetNames[0]; // Primera hoja
        const worksheet = workbook.Sheets[sheetName];

        // 📌 Convertir a JSON
        const data = xlsx.utils.sheet_to_json(worksheet, { raw: false });

        // 📌 Filtrar por ID de usuario y formatear la fecha correctamente
        const resultados = data.filter(row => row['ID de Usuario'] == idUsuario).map(row => {
            let fechaHora = row['Tiempo'];

            // 📌 Convertir formato de fecha si es necesario
            if (fechaHora instanceof Date) {
                fechaHora = moment(fechaHora).format("YYYY-MM-DD HH:mm:ss"); // Forzar formato correcto
            } else {
                fechaHora = moment(fechaHora, ["DD/MM/YYYY HH:mm:ss", "D/MM/YYYY HH:mm:ss", "YYYY-MM-DD HH:mm:ss"], true).format("YYYY-MM-DD HH:mm:ss");
            }

            return {
                tiempo: fechaHora,
                idUsuario: row['ID de Usuario'],
                nombre: row['Nombre'] || "Desconocido"
            };
        });

        return resultados;
    } catch (error) {
        console.error('❌ Error al leer el archivo Excel:', error);
        return [];
    }
}

// Ruta del archivo Excel (ajústala según tu entorno)
const rutaArchivo = path.join(__dirname, '../../uploads/hoy.xls');

// Prueba con ID de usuario 2
console.log(leerExcel(rutaArchivo, 2));