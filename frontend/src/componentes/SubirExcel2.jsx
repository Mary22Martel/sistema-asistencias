import { useState } from 'react';

const SubirExcel = ({ setResultados }) => {
    const [archivo, setArchivo] = useState(null);
    const [idUsuario, setIdUsuario] = useState('');
    const [salario, setSalario] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const subirArchivo = async () => {
        if (!archivo || !idUsuario || !salario || !fechaInicio || !fechaFin) {
            alert('Por favor, ingresa todos los datos y selecciona un archivo');
            return;
        }

        const formData = new FormData();
        formData.append('archivo', archivo);
        formData.append('idUsuario', idUsuario);
        formData.append('salario', salario);
        formData.append('fechaInicio', fechaInicio);
        formData.append('fechaFin', fechaFin);

        try {
            const response = await fetch('http://localhost:4000/api/upload/subir-excel', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setResultados(data);
        } catch (error) {
            console.error('Error al subir el archivo:', error);
        }
    };

    return (
        <div>
            <h3>Subir Archivo Excel</h3>
            <input type="text" placeholder="ID del Usuario" value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)} />
            <input type="number" placeholder="Salario Mensual" value={salario} onChange={(e) => setSalario(e.target.value)} />
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            <input type="file" accept=".xls,.xlsx" onChange={(e) => setArchivo(e.target.files[0])} />
            <button onClick={subirArchivo}>Subir</button>
        </div>
    );
};

export default SubirExcel;
