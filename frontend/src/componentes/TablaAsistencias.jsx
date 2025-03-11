import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TablaAsistencias = () => {
  const [asistencias, setAsistencias] = useState([]);

  useEffect(() => {
    const obtenerAsistencias = async () => {
      const respuesta = await axios.get('http://localhost:4000/api/asistencia');
      setAsistencias(respuesta.data);
    };
    obtenerAsistencias();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Fecha</th>
          <th>Descuento</th>
        </tr>
      </thead>
      <tbody>
        {asistencias.map(asistencia => (
          <tr key={asistencia.id}>
            <td>{asistencia.usuario_id}</td>
            <td>{new Date(asistencia.fecha_hora).toLocaleString()}</td>
            <td>S/ {asistencia.descuento}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TablaAsistencias;