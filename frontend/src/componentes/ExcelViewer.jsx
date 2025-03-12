const ExcelViewer = ({ resultados }) => {
    if (!resultados || !resultados.asistencias) {
        return <p>🔍 No hay datos disponibles. Sube un archivo para analizar asistencias.</p>;
    }

    return (
        <div>
            <h2>📊 Resultados del Archivo Subido</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Mañana</th>
                        <th>Salida Mañana</th>
                        <th>Estado Mañana</th>
                        <th>Tarde</th>
                        <th>Salida Tarde</th>
                        <th>Estado Tarde</th>
                        <th>Descuento</th>
                        <th>Detalles</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(resultados.asistencias).map(([fecha, data]) => (
                        <tr key={fecha}>
                            <td>{fecha}</td>
                            <td>{data.mañana || "No registrada"}</td>
                            <td>{data.salidaMañana || "No registrada"}</td>
                            <td>{data.estadoM}</td>
                            <td>{data.tarde || "No registrada"}</td>
                            <td>{data.salidaTarde || "No registrada"}</td>
                            <td>{data.estadoT}</td>
                            <td>S/. {data.descuento.toFixed(2)}</td>
                            <td>
                                {data.detalles.length > 0 
                                    ? data.detalles.map((detalle, index) => <p key={index}>{detalle}</p>)
                                    : "Sin observaciones"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3><strong>Total a pagar: S/. {resultados.totalPagar.toFixed(2)}</strong></h3>
        </div>
    );
};

export default ExcelViewer;
