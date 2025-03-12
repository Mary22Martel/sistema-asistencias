// App.jsx
import React, { useState } from 'react';
import './App.css';
import SubirExcel from './componentes/SubirExcel2';
import ExcelViewer from './componentes/ExcelViewer';

function App() {
  const [resultados, setResultados] = useState(null);

  return (
    <div className="main-container">
      {/* Sección para subir el archivo */}
      <section className="upload-section">
        <h1>🏢 Sistema de Gestión de Asistencias</h1>
        <div className="card">
          <SubirExcel setResultados={setResultados} />
        </div>
      </section>

      {/* Sección para mostrar los resultados */}
      {resultados && (
        <section className="results-section">
          <div className="card results-card">
            <ExcelViewer resultados={resultados} />
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
