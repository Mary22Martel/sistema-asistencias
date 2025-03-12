const ExcelViewer = ({ resultados }) => {
    if (!resultados || !resultados.asistencias) {
        return <p>🔍 No hay datos disponibles. Sube un archivo para analizar asistencias.</p>;
    }

    return (
        <div>
            <h2>Resultados</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Mañana</th>
                        <th>Estado Mañana</th>
                        <th>Tarde</th>
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
                            <td>{data.estadoM}</td>
                            <td>{data.tarde || "No registrada"}</td>
                            <td>{data.estadoT}</td>
                            <td>S/. {data.descuento.toFixed(2)}</td>
                            <td>
                                {data.detalles.map((detalle, index) => (
                                    <p key={index}>{detalle}</p>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3>Total a pagar: S/. {resultados.totalPagar.toFixed(2)}</h3>
        </div>
    );
};

export default ExcelViewer;
