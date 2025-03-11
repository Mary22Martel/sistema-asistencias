import React, { useState } from 'react';
import BuscarUsuario from "./componentes/BuscarUsuario";
import SubirExcel from "./componentes/SubirExcel";
import Resultados from "./componentes/Resultados";
import ExcelViewer from './componentes/ExcelViewer';
import SubirExcel2 from './componentes/SubirExcel2';

function App() {
  const [resultados, setResultados] = useState([]);
  

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
            <h1>📋 Sistema de Gestión de Asistencias</h1>
            <h2>Gestión de Eventos</h2>

            <SubirExcel2 setResultados={setResultados} />

            {resultados.length > 0 && (
                <>
                    <h3>Resultados del Archivo Subido</h3>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Tiempo</th>
                                <th>ID de Usuario</th>
                                <th>Nombre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultados.map((evento, index) => (
                                <tr key={index}>
                                    <td>{evento.tiempo}</td>
                                    <td>{evento.idUsuario}</td>
                                    <td>{evento.nombre}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            <ExcelViewer />
        </div>
    </div>

    
  );
}

export default App;