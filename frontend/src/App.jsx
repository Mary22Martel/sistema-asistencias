import React, { useState } from 'react';
import SubirExcel from "./componentes/SubirExcel";
import BuscarUsuario from "./componentes/BuscarUsuario"; // Componente faltante
import Resultados from "./componentes/Resultados"; // Componente faltante

function App() {
  const [resultados, setResultados] = useState(null);

  return (
    <div>
      <h1>Sistema de Asistencias</h1>
      <SubirExcel />
      <BuscarUsuario onResultado={setResultados} />
      <Resultados datos={resultados} />
    </div>
  );
}

export default App;