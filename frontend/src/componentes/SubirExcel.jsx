import React, { useState } from "react";
import axios from "axios";

const SubirExcel = () => {
  const [archivo, setArchivo] = useState(null);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    const datosFormulario = new FormData();
    datosFormulario.append("excel", archivo);

    try {
      await axios.post("http://localhost:4000/api/asistencia/subir", datosFormulario);
      alert("Archivo subido correctamente");
    } catch (error) {
      alert("Error al subir el archivo");
    }
  };

  return (
    <form onSubmit={manejarEnvio}>
      <input type="file" onChange={(e) => setArchivo(e.target.files[0])} />
      <button type="submit">Subir Excel</button>
    </form>
  );
};

export default SubirExcel;