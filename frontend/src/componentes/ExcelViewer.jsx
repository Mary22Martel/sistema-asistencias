import { useState } from 'react';

const ExcelViewer = () => {
    const [idUsuario, setIdUsuario] = useState('');
    const [datos, setDatos] = useState([]);

    const obtenerDatos = async () => {
        if (!idUsuario) return alert('Por favor, ingresa un ID de usuario');

        try {
            const response = await fetch(`http://localhost:4000/api/excel/filtrar/${idUsuario}`);
            const data = await response.json();
            setDatos(data);
        } catch (error) {
            console.error('Error obteniendo los datos:', error);
        }
    };

    return (
        <div>
            <h2>Filtrar Eventos por Usuario</h2>
            <input
                type="number"
                placeholder="Ingrese ID de usuario"
                value={idUsuario}
                onChange={(e) => setIdUsuario(e.target.value)}
            />
            <button onClick={obtenerDatos}>Buscar</button>

            {datos.length > 0 && (
                <table border="1">
                    <thead>
                        <tr>
                            <th>Tiempo</th>
                            <th>ID de Usuario</th>
                            <th>Nombre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map((evento, index) => (
                            <tr key={index}>
                                <td>{evento.tiempo}</td>
                                <td>{evento.idUsuario}</td>
                                <td>{evento.nombre}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ExcelViewer;
