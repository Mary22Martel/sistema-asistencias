import React, { useState } from "react";
import axios from "axios";

const BuscarUsuario = ({ onResultado }) => {
  const [idUsuario, setIdUsuario] = useState("");

  const handleBuscar = async () => {
    try {
      const respuesta = await axios.get(`http://localhost:4000/api/asistencia/usuario/${idUsuario}`);
      onResultado(respuesta.data);
    } catch (error) {
      alert("Error al buscar usuario");
    }
  };

  return (
    <div>
      <input
        type="number"
        placeholder="Ingrese ID de usuario"
        value={idUsuario}
        onChange={(e) => setIdUsuario(e.target.value)}
      />
      <button onClick={handleBuscar}>Buscar</button>
    </div>
  );
};

export default BuscarUsuario;
