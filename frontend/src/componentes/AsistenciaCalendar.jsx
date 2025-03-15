// src/componentes/AsistenciaCalendar.jsx
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment';

function estaFueraDeRango(dateStr, fechaInicio, fechaFin) {
  const d = moment(dateStr, "YYYY-MM-DD");
  const start = moment(fechaInicio, "YYYY-MM-DD");
  const end = moment(fechaFin, "YYYY-MM-DD");
  return d.isBefore(start) || d.isAfter(end);
}

const AsistenciaCalendar = ({
  fechaInicio,
  fechaFin,
  asistenciasGlobal,
  totalPagarGlobal
}) => {
  // Contenido en cada celda del calendario
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = moment(date).format('YYYY-MM-DD');

      if (estaFueraDeRango(dateStr, fechaInicio, fechaFin)) {
        return <div style={{ fontSize: '0.65em' }}>Fuera de rango</div>;
      }

      const info = asistenciasGlobal[dateStr];
      if (!info) {
        // En teoría no pasa, pero lo dejamos por seguridad
        return <div style={{ fontSize: '0.65em', color: 'red' }}>¿Sin datos?</div>;
      }

      return (
        <div style={{ fontSize: '0.65em', textAlign: 'left' }}>
          <strong>{info.estadoM}</strong> / <strong>{info.estadoT}</strong><br />
          {info.descuento > 0 && (
            <span style={{ color: 'red' }}>
              Desc: S/. {info.descuento.toFixed(2)}
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  // Clases CSS para colorear las celdas
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = moment(date).format('YYYY-MM-DD');
      if (estaFueraDeRango(dateStr, fechaInicio, fechaFin)) {
        return 'tile-out-of-range';
      }
      const info = asistenciasGlobal[dateStr];
      if (!info) return '';

      if (info.estadoM === 'Descanso' && info.estadoT === 'Descanso') {
        return 'tile-descanso';
      }
      if (info.estadoM === 'Ausente' && info.estadoT === 'Ausente') {
        return 'tile-ausente';
      }
      // etc. para tardanza...
    }
    return '';
  };

  return (
    <div>
      <h2>Calendario de Asistencia</h2>

      <Calendar
        defaultActiveStartDate={fechaInicio ? new Date(fechaInicio) : new Date()}
        tileContent={tileContent}
        tileClassName={tileClassName}
      />
      <div style={{ marginTop: '1rem', fontSize: '1.2rem', textAlign: 'center' }}>
        <strong>Total a pagar:</strong> S/. {totalPagarGlobal.toFixed(2)}
      </div>

    </div>
  );
};

export default AsistenciaCalendar;
