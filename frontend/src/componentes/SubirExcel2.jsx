// SubirExcel2.jsx
import { useState } from 'react';
import { FaUpload, FaUser, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';
import '../App.css'; // Asegúrate de importar los estilos globales

const SubirExcel = ({
  setResultados,
  setIdUsuario,
  setSalario,
  setFechaInicio,
  setFechaFin
}) => {
  const [archivo, setArchivo] = useState(null);
  const [localIdUsuario, setLocalIdUsuario] = useState('');
  const [localSalario, setLocalSalario] = useState('');
  const [localFechaInicio, setLocalFechaInicio] = useState('');
  const [localFechaFin, setLocalFechaFin] = useState('');
  const [error, setError] = useState('');

  const subirArchivo = async () => {
    // Validación de todos los campos
    if (!archivo || !localIdUsuario || !localSalario || !localFechaInicio || !localFechaFin) {
      setError('Por favor, completa todos los campos y selecciona un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('idUsuario', localIdUsuario);
    formData.append('salario', localSalario);
    formData.append('fechaInicio', localFechaInicio);
    formData.append('fechaFin', localFechaFin);

    try {
      const response = await fetch('http://localhost:4000/api/upload/subir-excel', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      // Actualizamos los estados en el componente padre
      setIdUsuario(localIdUsuario);
      setSalario(localSalario);
      setFechaInicio(localFechaInicio);
      setFechaFin(localFechaFin);
      
      setResultados(data);
      setError('');
    } catch (err) {
      console.error('Error al subir el archivo:', err);
      setError('Hubo un error al subir el archivo. Inténtalo de nuevo.');
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#0d3b66' }}>
        Filtrar por Trabajador
      </h2>

      {error && <p className="error-message">{error}</p>}

      {/* Contenedor que divide los inputs en dos columnas en pantallas grandes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Primera columna */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaUser style={{ color: '#0d3b66' }} />
          <input
            type="text"
            placeholder="ID del Usuario"
            value={localIdUsuario}
            onChange={(e) => setLocalIdUsuario(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaDollarSign style={{ color: '#0d3b66' }} />
          <input
            type="number"
            placeholder="Salario Mensual"
            value={localSalario}
            onChange={(e) => setLocalSalario(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
            }}
          />
        </div>

        {/* Segunda columna */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaCalendarAlt style={{ color: '#0d3b66' }} />
          <input
            type="date"
            value={localFechaInicio}
            onChange={(e) => setLocalFechaInicio(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaCalendarAlt style={{ color: '#0d3b66' }} />
          <input
            type="date"
            value={localFechaFin}
            onChange={(e) => setLocalFechaFin(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
            }}
          />
        </div>

        {/* Fila para el archivo (ocupa dos columnas con gridColumn) */}
        <div
          style={{
            gridColumn: '1 / 3',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FaUpload style={{ color: '#0d3b66' }} />
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => setArchivo(e.target.files[0])}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
            }}
          />
        </div>
      </div>

      <button onClick={subirArchivo} className="btn-primary" style={{ display: 'block', margin: '0 auto' }}>
        Subir Archivo
      </button>
    </div>
  );
};

export default SubirExcel;
