// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import SubirExcel from './componentes/SubirExcel2';
import ExcelViewer from './componentes/ExcelViewer';
import AsistenciaCalendar from './componentes/AsistenciaCalendar';

function App() {
  // Estado que se llena cuando subes el archivo (parciales)
  const [resultados, setResultados] = useState(null);

  // Estados para los datos del formulario
  const [idUsuario, setIdUsuario] = useState('');
  const [salario, setSalario] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // *** Estados "globales" para asistencias completadas y total a pagar ***
  const [asistenciasGlobal, setAsistenciasGlobal] = useState({});
  const [totalPagarGlobal, setTotalPagarGlobal] = useState(0);

  return (
    <div className="main-container">
      <section className="upload-section">
        <h1>🏢 Sistema de Gestión de Asistencias</h1>
        <div className="card">
          <SubirExcel
            setResultados={setResultados}
            setIdUsuario={setIdUsuario}
            setSalario={setSalario}
            setFechaInicio={setFechaInicio}
            setFechaFin={setFechaFin}
          />
        </div>
      </section>

      {resultados ? (
        <section className="results-section">
          <div className="card results-card">
            {/* 
              Pasamos las props necesarias a ExcelViewer.
              Además, le pasamos los estados globales para que,
              cuando haga "Ver Horario Completo",
              los pueda actualizar.
            */}
            <ExcelViewer
              resultados={resultados}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              salarioMensual={Number(salario)}
              asistenciasGlobal={asistenciasGlobal}
              setAsistenciasGlobal={setAsistenciasGlobal}
              totalPagarGlobal={totalPagarGlobal}
              setTotalPagarGlobal={setTotalPagarGlobal}
            />

            {/* 
              El calendario ya NO hace fetch.
              Simplemente muestra los datos que tenga en asistenciasGlobal.
            */}
            <AsistenciaCalendar
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              asistenciasGlobal={asistenciasGlobal}
              totalPagarGlobal={totalPagarGlobal}
            />
          </div>
        </section>
      ) : (
        <p className="no-results">No hay resultados para mostrar.</p>
      )}
    </div>
  );
}

export default App;
