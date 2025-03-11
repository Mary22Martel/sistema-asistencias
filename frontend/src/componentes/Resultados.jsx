import React from "react";

const Resultados = ({ datos }) => {
  if (!datos || !datos.usuario) return <p>No hay datos disponibles.</p>;

  const sueldoBase = Number(datos.usuario.sueldo_base) || 0;
  const sueldoNeto = Number(datos.usuario.sueldo_neto) || 0;

  return (
    <div>
      <h2>Resultados para: {datos.usuario.nombre || "Usuario Desconocido"}</h2>
      <p><strong>Sueldo base:</strong> S/ {sueldoBase.toFixed(2)}</p>
      <p><strong>Sueldo neto después de descuentos:</strong> S/ {sueldoNeto.toFixed(2)}</p>

      <h3>Detalle diario:</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora de Marcación</th>
            <th>Tipo de Evento</th>
            <th>Turno</th>
            <th>Descuento Total</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {datos.asistencias.length > 0 ? (
            datos.asistencias.map((dia, index) => {
              const descuento = Number(dia.descuento) || 0;

              return (
                <tr key={index}>
                  <td>{new Date(dia.fecha).toLocaleDateString()}</td>
                  <td>{dia.hora_entrada || "No registrado"}</td>
                  <td>{dia.tipo_evento === "entrada" ? "Entrada" : "Salida"}</td>
                  <td>{dia.turno || "No especificado"}</td>
                  <td>S/ {descuento.toFixed(2)}</td>
                  <td>
                    {dia.tipo_evento === "entrada" && descuento > 0
                      ? `Se aplicó un descuento de S/ ${descuento.toFixed(2)} por ingresar tarde.`
                      : "Sin descuentos"}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6">No hay registros de asistencia</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Resultados;
