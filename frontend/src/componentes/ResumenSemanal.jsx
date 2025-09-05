// src/componentes/ResumenSemanal.jsx
import React, { useState, useEffect } from 'react';
import { calcularResumenSemanal } from '../utilidades/calcularResumenSemanal';

const ResumenSemanal = ({ asistenciasGlobal, fechaInicio, fechaFin }) => {
  const [resumen, setResumen] = useState([]);

  useEffect(() => {
    if (!fechaInicio || !fechaFin) return;
    if (Object.keys(asistenciasGlobal).length === 0) return;

    // Calcula el resumen semanal
    const resultado = calcularResumenSemanal(asistenciasGlobal, fechaInicio, fechaFin);
    setResumen(resultado);
  }, [asistenciasGlobal, fechaInicio, fechaFin]);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Resumen Semanal</h3>
      {resumen.map((sem) => (
        <div key={sem.weekNumber} style={{ marginBottom: '1rem' }}>
          <strong>
            Semana {sem.weekNumber} ({sem.rango})
          </strong>
          <p>Tardanzas Mañana: {sem.tardanzasM}</p>
          <p>Tardanzas Tarde: {sem.tardanzasT}</p>
          <p>Ausencias: {sem.ausencias}</p>
        </div>
      ))}
      {resumen.length === 0 && <p>No hay datos para mostrar.</p>}
    </div>
  );
};

export default ResumenSemanal;
