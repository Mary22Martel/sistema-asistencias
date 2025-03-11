import React, { useState } from 'react';
import axios from 'axios';

const BuscarUsuario = ({ onResultado }) => {
  const [idUsuario, setIdUsuario] = useState('');

  const handleBuscar = async () => {
    if (!idUsuario) {
      alert("Por favor ingresa un ID de usuario");
      return;
    }

    try {
      const respuesta = await axios.get(
        `http://localhost:4000/api/asistencia/usuario/${idUsuario}`
      );
      onResultado(respuesta.data);
    } catch (error) {
      alert(`Error: ${error.response?.data?.error || "Error desconocido"}`);
    }
  };

  return (
    <div className="input-group mb-3">
      <input
        type="number"
        className="form-control"
        placeholder="Ingresa ID de usuario"
        value={idUsuario}
        onChange={(e) => setIdUsuario(e.target.value)}
      />
      <button 
        className="btn btn-primary"
        onClick={handleBuscar}
      >
        🔍 Buscar
      </button>
    </div>
  );
};

export default BuscarUsuario;