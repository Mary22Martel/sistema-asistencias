import React, { useEffect } from 'react';
import { completarDiasFaltantes } from '../../../backend/src/utilidades/completarCalendario.js';
import '../ExcelViewer.css'; // Importa el archivo CSS
import * as XLSX from 'xlsx';

import { saveAs } from 'file-saver';

const ExcelViewer = ({
  resultados,
  fechaInicio,
  fechaFin,
  salarioMensual,
  asistenciasGlobal,
  setAsistenciasGlobal,
  totalPagarGlobal,
  setTotalPagarGlobal
}) => {
  useEffect(() => {
    // 1) Verificamos que tengamos data y fechas válidas
    if (
      resultados && resultados.asistencias &&
      fechaInicio && fechaFin &&
      fechaInicio.trim() !== '' && fechaFin.trim() !== ''
    ) {
      // 2) Llamar a completarDiasFaltantes
      const respuesta = completarDiasFaltantes(
        resultados.asistencias,  // asistencias parciales
        fechaInicio,
        fechaFin,
        salarioMensual,
        30  // Días laborales en el mes
      );

      // 3) Calcular nuevo total
      const totalConAusencias = parseFloat(salarioMensual) - respuesta.totalDescuentoFinal;

      // 4) Actualizar estados globales para que calendario y tabla vean la misma info
      setAsistenciasGlobal(respuesta.asistencias);
      setTotalPagarGlobal(totalConAusencias);
    }
  }, [
    resultados,
    fechaInicio,
    fechaFin,
    salarioMensual,
    setAsistenciasGlobal,
    setTotalPagarGlobal
  ]);

  // Función para exportar a Excel
  const exportToExcel = () => {
    const data = Object.keys(asistenciasGlobal).sort().map(fecha => {
      const item = asistenciasGlobal[fecha];
      return {
        Fecha: fecha,
        Mañana: item.mañana || 'No registrada',
        'Salida Mañana': item.salidaMañana || 'No registrada',
        'Estado Mañana': item.estadoM,
        Tarde: item.tarde || 'No registrada',
        'Salida Tarde': item.salidaTarde || 'No registrada',
        'Estado Tarde': item.estadoT,
        Descuento: item.descuento.toFixed(2),
        Detalles: item.detalles ? item.detalles.join(', ') : "Sin observaciones"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'resultados.xlsx');
  };

  return (
    <div className="viewer-container">
      <h2 className="viewer-title">
        <span role="img" aria-label="icono">📊</span> Resultados del Archivo Subido
      </h2>
      <br />

      {/* Mostrar la tabla con las asistencias (ya completadas) */}
      <div className="table-responsive">
        <table className="my-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Mañana</th>
              <th>Salida Mañana</th>
              <th>Estado Mañana</th>
              <th>Tarde</th>
              <th>Salida Tarde</th>
              <th>Estado Tarde</th>
              <th>Descuento</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(asistenciasGlobal).sort().map((fecha) => {
              const data = asistenciasGlobal[fecha];
              return (
                <tr key={fecha}>
                  <td>{fecha}</td>
                  <td>{data.mañana || 'No registrada'}</td>
                  <td>{data.salidaMañana || 'No registrada'}</td>
                  <td>{data.estadoM}</td>
                  <td>{data.tarde || 'No registrada'}</td>
                  <td>{data.salidaTarde || 'No registrada'}</td>
                  <td>{data.estadoT}</td>
                  <td>S/. {data.descuento.toFixed(2)}</td>
                  <td>
                    {data.detalles?.length
                      ? data.detalles.map((detalle, index) => (
                          <p key={index}>{detalle}</p>
                        ))
                      : "Sin observaciones"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h3 className="total-a-pagar" style={{ textAlign: "center" }}>
        Total a pagar: S/. {totalPagarGlobal.toFixed(2)}
      </h3>

      {/* Botón para exportar a Excel */}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button className="btn-primary" onClick={exportToExcel}>
          Exportar a Excel
        </button>
      </div>
    </div>
  );
};

export default ExcelViewer;
