import React, { useState } from 'react';
import SubirExcel2 from './componentes/SubirExcel2';
import ExcelViewer from './componentes/ExcelViewer';

function App() {
    const [resultados, setResultados] = useState(null); // ✅ Iniciar como null

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-5">🏢 Sistema de Gestión de Asistencias</h1>

            <h2>Gestión de Eventos</h2>
            <SubirExcel2 setResultados={setResultados} />

            {resultados && resultados.asistencias ? ( // ✅ Verificamos que existan datos
                <>
                    <h3>📊 Resultados del Archivo Subido</h3>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Mañana</th>
                                <th>Tarde</th>
                                <th>Estado Mañana</th>
                                <th>Estado Tarde</th>
                                <th>Descuento</th>
                                <th>Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(resultados.asistencias).map(([fecha, data]) => (
                                <tr key={fecha}>
                                    <td>{fecha}</td>
                                    <td>{data.mañana || "No registrada"}</td>
                                    <td>{data.tarde || "No registrada"}</td>
                                    <td>{data.estadoM}</td>
                                    <td>{data.estadoT}</td>
                                    <td>S/. {data.descuento.toFixed(2)}</td>
                                    <td>{data.detalles.join(" | ")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h3>Total a pagar: S/. {resultados.totalPagar.toFixed(2)}</h3>
                </>
            ) : (
                <p>🔍 No hay datos disponibles. Sube un archivo para analizar asistencias.</p>
            )}
        </div>
    );
}

export default App;
