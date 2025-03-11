import { useState } from 'react';

const SubirExcel = ({ setResultados }) => {
    const [archivo, setArchivo] = useState(null);

    const handleArchivo = (event) => {
        setArchivo(event.target.files[0]);
    };

    const subirArchivo = async () => {
        if (!archivo) {
            alert('Por favor, selecciona un archivo');
            return;
        }

        const formData = new FormData();
        formData.append('archivo', archivo);

        try {
            const response = await fetch('http://localhost:4000/api/upload/subir-excel', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setResultados(data); // Guardar los datos para mostrarlos en la tabla
        } catch (error) {
            console.error('Error al subir el archivo:', error);
        }
    };

    return (
        <div>
            <h3>Subir Archivo Excel</h3>
            <input type="file" accept=".xls,.xlsx" onChange={handleArchivo} />
            <button onClick={subirArchivo}>Subir</button>
        </div>
    );
};

export default SubirExcel;
