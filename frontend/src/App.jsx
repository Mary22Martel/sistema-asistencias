import React, { useState } from 'react';
import './App.css';
import SubirExcel from './componentes/SubirExcel2';
import ExcelViewer from './componentes/ExcelViewer';
import AsistenciaCalendar from './componentes/AsistenciaCalendar';
import DominicalSection from './componentes/DominicalSection';

function App() {
  // Estados del formulario
  const [resultados, setResultados] = useState(null);
  const [idUsuario, setIdUsuario] = useState('');
  const [salario, setSalario] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Asistencias y totales
  const [asistenciasGlobal, setAsistenciasGlobal] = useState({});

  // 1) baseTotal: cálculo base (salario - tardanzas/ausencias).
  // 2) dominicalDiscount: descuento por domingos ausentes que el usuario elija descontar.
  const [baseTotal, setBaseTotal] = useState(0);
  const [dominicalDiscount, setDominicalDiscount] = useState(0);

  // Cuando "Aplicar Dominical" retorne el descuento
  const handleDominicalProcesado = (data) => {
    // data => { descuentoDominical: X }
    // Guardamos ese descuento en dominicalDiscount
    setDominicalDiscount(data.descuentoDominical);
  };

  // Total final = baseTotal - dominicalDiscount
  const finalTotal = baseTotal - dominicalDiscount;

  return (
    <div className="app-container">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <h1 className="hero-title">
            🏢 Sistema de Gestión de
            <span className="hero-subtitle">Asistencias</span>
          </h1>
          <p className="hero-description">
            Gestiona y calcula asistencias de empleados de manera eficiente
          </p>
        </div>
        
        <div className="upload-card">
          <SubirExcel
            setResultados={setResultados}
            setIdUsuario={setIdUsuario}
            setSalario={setSalario}
            setFechaInicio={setFechaInicio}
            setFechaFin={setFechaFin}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {resultados ? (
          <section className="results-section">
            <div className="results-card">
              {/* Summary Card */}
              <div className="summary-card">
                <div className="summary-header">
                  <h2>Resumen de Cálculo</h2>
                  <div className="summary-badge">
                    {idUsuario && <span>ID: {idUsuario}</span>}
                  </div>
                </div>
                
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Salario Base</span>
                    <span className="stat-value">S/. {Number(salario).toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Base</span>
                    <span className="stat-value">S/. {baseTotal.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Descuento Dominical</span>
                    <span className="stat-value discount">-S/. {dominicalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="stat-item total">
                    <span className="stat-label">Total Final</span>
                    <span className="stat-value">S/. {finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Excel Viewer */}
              <div className="grid-item excel-viewer">
                <div className="section-header">
                  <h3>Datos del Excel</h3>
                  <div className="section-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                </div>
                <ExcelViewer
                  resultados={resultados}
                  fechaInicio={fechaInicio}
                  fechaFin={fechaFin}
                  salarioMensual={Number(salario)}
                  asistenciasGlobal={asistenciasGlobal}
                  setAsistenciasGlobal={setAsistenciasGlobal}
                  baseTotal={baseTotal}
                  setBaseTotal={setBaseTotal}
                  finalTotal={finalTotal}
                />
              </div>

              {/* Calendar */}
              <div className="grid-item calendar-viewer">
                <div className="section-header">
                  <h3>Calendario de Asistencias</h3>
                  <div className="section-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                    </svg>
                  </div>
                </div>
                <AsistenciaCalendar
                  fechaInicio={fechaInicio}
                  fechaFin={fechaFin}
                  asistenciasGlobal={asistenciasGlobal}
                  totalPagarGlobal={finalTotal}
                />
              </div>

              {/* Dominical Section */}
              <div className="grid-item dominical-section">
                <div className="section-header">
                  <h3>Cálculo Dominical</h3>
                  <div className="section-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                    </svg>
                  </div>
                </div>
                <DominicalSection
                  asistencias={asistenciasGlobal}
                  fechaInicio={fechaInicio}
                  fechaFin={fechaFin}
                  salarioMensual={Number(salario)}
                  onDominicalProcesado={handleDominicalProcesado}
                />
              </div>
            </div>
          </section>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <h3>No hay datos para mostrar</h3>
            <p>Sube un archivo Excel para comenzar el análisis de asistencias</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;