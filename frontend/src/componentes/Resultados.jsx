import React from 'react';

const formatoHora = (horaStr) => {
  try {
    const fecha = new Date(horaStr);
    return fecha.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return "--:--:--";
  }
};

const ordenarRegistros = (registros) => {
  return [...registros].sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
};

const Resultados = ({ datos }) => {
  if (!datos?.usuario) {
    return <div className="no-datos">Seleccione un usuario</div>;
  }

  return (
    <div className="resultados">
      <div className="resumen">
        <h2>{datos.usuario.nombre}</h2>
        <div className="datos-financieros">
          <p>Sueldo base: S/ {datos.usuario.sueldo.toFixed(2)}</p>
          <p>Total descuentos: S/ {Number(datos.usuario.total_descuento || 0).toFixed(2)}</p>
          <p>Sueldo neto: S/ {(datos.usuario.sueldo - Number(datos.usuario.total_descuento || 0)).toFixed(2)}</p>
        </div>
      </div>

      {datos.dias.map((dia, indexDia) => (
        <div key={indexDia} className="dia">
          <h3>
            {new Date(dia.fecha).toLocaleDateString('es-PE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Turno</th>
                <th>Descuento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenarRegistros(dia.registros).map((registro, i) => (
                <tr key={i} className={registro.descuento > 0 ? 'con-descuento' : ''}>
                  <td>{formatoHora(registro.fecha_hora)}</td>
                  <td>{registro.tipo_evento?.toUpperCase() || "Sin datos"}</td>
                  <td>{registro.turno || "No especificado"}</td>
                  <td>S/ {Number(registro.descuento || 0).toFixed(2)}</td>
                  <td>{registro.detalle ? registro.detalle.trim() : "Sin detalles"}</td> {/* ✅ Verificar `detalle` */}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3">Total del día</td>
                <td colSpan="2">S/ {Number(dia.total_descuento || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Resultados;
