import React, { useState } from 'react';
import BuscarUsuario from "./componentes/BuscarUsuario";
import SubirExcel from "./componentes/SubirExcel";
import Resultados from "./componentes/Resultados";
import ExcelViewer from './componentes/ExcelViewer';

function App() {
  const [resultados, setResultados] = useState(null);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-5">🏢 Sistema de Gestión de Asistencias</h1>
      
      {/* Sección de carga de archivo */}
      {/* <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">📤 Subir Archivo Excel</h5>
          <SubirExcel />
        </div>
      </div> */}

      {/* Búsqueda de usuario */}
      {/* <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">🔎 Buscar Usuario</h5>
          <BuscarUsuario onResultado={setResultados} />
        </div>
      </div> */}

      {/* Resultados */}
      {/* {resultados && <Resultados datos={resultados} />} */}

      <div>
            <h1>Gestión de Eventos</h1>
            <ExcelViewer />
        </div>
    </div>

    
  );
}

export default App;