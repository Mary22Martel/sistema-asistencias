// ExcelViewer.jsx
import React from 'react';
import '../ExcelViewer.css';

const ExcelViewer = ({ resultados }) => {
  if (!resultados || !resultados.asistencias) {
    return (
      <div className="viewer-container">
        <p className="no-data">
          🔍 No hay datos disponibles. Sube un archivo para analizar asistencias.
        </p>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <h2 className="viewer-title">
        <span role="img" aria-label="icono">📊</span> Resultados del Archivo Subido
      </h2>

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
            {Object.entries(resultados.asistencias).map(([fecha, data]) => (
              <tr key={fecha}>
                <td>{fecha}</td>
                <td>{data.mañana || "No registrada"}</td>
                <td>{data.salidaMañana || "No registrada"}</td>
                <td>{data.estadoM}</td>
                <td>{data.tarde || "No registrada"}</td>
                <td>{data.salidaTarde || "No registrada"}</td>
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
            ))}
          </tbody>
        </table>
      </div>
      <hr style={{ margin: "20px 0" }} />

      <h3 className="total-a-pagar" style={{ textAlign: "center" }}>
        Total a pagar: S/. {resultados.totalPagar.toFixed(2)}
    </h3>

    </div>
  );
};

export default ExcelViewer;
