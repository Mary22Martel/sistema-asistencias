import React, { useState } from 'react';
import SubirExcel2 from './componentes/SubirExcel2';
import ExcelViewer from './componentes/ExcelViewer';

function App() {
    const [resultados, setResultados] = useState(null); // ✅ Iniciar como null para evitar errores

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-5">🏢 Sistema de Gestión de Asistencias</h1>

            <h2>Gestión de Eventos</h2>
            <SubirExcel2 setResultados={setResultados} />

            {/* ✅ Pasamos los datos a ExcelViewer para manejar la visualización */}
            {resultados && resultados.asistencias ? (
                <ExcelViewer resultados={resultados} />
            ) : (
                <p>🔍 No hay datos disponibles. Sube un archivo para analizar asistencias.</p>
            )}
        </div>
    );
}

export default App;
