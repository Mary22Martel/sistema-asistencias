// src/componentes/DominicalSection.jsx
import React, { useState, useEffect } from 'react';
import moment from 'moment';

/**
 * - Divide [fechaInicio, fechaFin] en semanas de 7 días.
 * - Muestra tardanzas y ausencias (lunes-sábado) y asume domingo como "Descanso".
 * - Permite "Descontar" o "Pasar" el domingo.
 * - Llama a onDominicalProcesado({ descuentoDominical }) con la suma final.
 */
function DominicalSection({
  asistencias,
  fechaInicio,
  fechaFin,
  salarioMensual,
  onDominicalProcesado
}) {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    // Evitar errores si faltan datos
    if (!fechaInicio || !fechaFin || !asistencias || Object.keys(asistencias).length === 0) {
      setBlocks([]);
      return;
    }

    const newBlocks = [];
    let start = moment(fechaInicio, "YYYY-MM-DD");
    const end = moment(fechaFin, "YYYY-MM-DD");
    let blockIndex = 1;

    while (start.isSameOrBefore(end)) {
      // Bloque de 7 días: [start ... start+6]
      const blockStart = moment(start);
      let blockEnd = moment(start).add(6, 'days');
      if (blockEnd.isAfter(end)) {
        blockEnd = end.clone();
      }

      let tardanzasM = 0;
      let tardanzasT = 0;
      let ausencias = 0;

      // Para el domingo
      let sundayDate = null;
      let discountChoice = false; // "pasar" por defecto

      let cursor = blockStart.clone();
      while (cursor.isSameOrBefore(blockEnd)) {
        const dayOfWeek = cursor.day(); // 0 = domingo
        const dateStr = cursor.format("YYYY-MM-DD");
        const data = asistencias[dateStr];

        if (dayOfWeek === 0) {
          // Es domingo => "Descanso"
          sundayDate = dateStr;
        } else {
          // Lunes a sábado => contar tardanzas/ausencias
          if (data) {
            // Tardanza mañana
            if (data.estadoM && data.estadoM.includes("Tardanza")) {
              tardanzasM++;
            }
            // Tardanza tarde
            if (data.estadoT && data.estadoT.includes("Tardanza")) {
              tardanzasT++;
            }
            // Ausencias (media jornada)
            if (data.estadoM === "Ausente") ausencias++;
            if (data.estadoT === "Ausente") ausencias++;
          }
        }

        cursor.add(1, 'day');
      }

      newBlocks.push({
        blockIndex,
        blockStart: blockStart.format("YYYY-MM-DD"),
        blockEnd: blockEnd.format("YYYY-MM-DD"),
        tardanzasM,
        tardanzasT,
        ausencias,
        sundayDate,
        discountChoice
      });

      blockIndex++;
      start = blockEnd.add(1, 'day');
    }

    setBlocks(newBlocks);
  }, [asistencias, fechaInicio, fechaFin, salarioMensual]);

  // Manejar el cambio "Descontar" / "Pasar"
  const handleDiscountChange = (index, value) => {
    setBlocks(prev => {
      const arr = [...prev];
      arr[index].discountChoice = (value === 'descontar');
      return arr;
    });
  };

  // Sumar todos los descuentos por domingo
  const handleAplicar = () => {
    const dailySalary = salarioMensual / 30;
    let totalDiscount = 0;

    blocks.forEach(b => {
      // Si hay un domingo en el bloque y se elige "descontar", sumamos un día
      if (b.sundayDate && b.discountChoice) {
        totalDiscount += dailySalary;
      }
    });

    if (onDominicalProcesado) {
      onDominicalProcesado({ descuentoDominical: totalDiscount });
    }
  };

  return (
    <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
      <h3>Resumen Semanal (Dominical)</h3>

      {blocks.map((b, idx) => (
        <div key={b.blockIndex} style={{ marginBottom: '1rem' }}>
          <strong>
            Semana {b.blockIndex} ({b.blockStart} al {b.blockEnd})
          </strong>
          <p>Tardanzas Mañana (Lun-Sab): {b.tardanzasM}</p>
          <p>Tardanzas Tarde (Lun-Sab): {b.tardanzasT}</p>
          <p>Ausencias (Lun-Sab, media jornada): {b.ausencias}</p>

          {b.sundayDate ? (
            <>
              <p>Domingo (Descanso): {b.sundayDate}</p>
              <label>Descuento del domingo: </label>
              <select
                value={b.discountChoice ? "descontar" : "pasar"}
                onChange={(e) => handleDiscountChange(idx, e.target.value)}
              >
                <option value="descontar">Descontar</option>
                <option value="pasar">Pasar</option>
              </select>
            </>
          ) : (
            <p>No hay domingo en este bloque.</p>
          )}
        </div>
      ))}

      {blocks.length > 0 && (
        <button onClick={handleAplicar}>Aplicar Dominical</button>
      )}
    </div>
  );
}

export default DominicalSection;
