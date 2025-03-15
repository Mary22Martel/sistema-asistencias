// src/componentes/AsistenciaCalendar.jsx
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
        return <div style={{ fontSize: '0.65em', color: 'red' }}>¿Sin datos?</div>;
      }

      return (
        <div style={{ fontSize: '0.65em', textAlign: 'left' }}>
          <strong>{info.estadoM}</strong> / <strong>{info.estadoT}</strong>
          <br />
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
      // Puedes agregar más condiciones según tus necesidades
    }
    return '';
  };

  // Función para exportar el calendario a PDF
  const exportToPDF = () => {
    const calendarElement = document.getElementById("calendar");
    if (!calendarElement) return;

    html2canvas(calendarElement)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('calendario-asistencias.pdf');
      })
      .catch((error) => {
        console.error("Error exportando el PDF:", error);
      });
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Calendario de Asistencia</h2>

      {/* Contenedor del calendario para capturarlo */}
      <div id="calendar">
        <Calendar
          defaultActiveStartDate={fechaInicio ? new Date(fechaInicio) : new Date()}
          tileContent={tileContent}
          tileClassName={tileClassName}
        />
      </div>

      <div style={{ marginTop: '1rem', fontSize: '1.2rem', textAlign: 'center' }}>
        <strong>Total a pagar:</strong> S/. {totalPagarGlobal.toFixed(2)}
      </div>

      {/* Botón para exportar a PDF */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={exportToPDF}>Exportar Calendario a PDF</button>
      </div>
    </div>
  );
};

export default AsistenciaCalendar;
