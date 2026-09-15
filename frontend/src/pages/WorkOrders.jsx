import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function WorkOrders() {

    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [plate, setPlate] = useState("");
    const [status, setStatus] = useState("");

    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        getWorkOrders();
    }, [page]);

    const getWorkOrders = async () => {
        try {

            setLoading(true);
            setError("");

            const response = await api.get("/work-orders", {
                params: {
                    plate: plate,
                    status: status,
                    page: page,
                    pageSize: pageSize
                }
            });

            setOrders(response.data.data);
            setTotal(response.data.total);

        } catch (error) {

            console.error(error);

            setError("No se pudieron cargar las órdenes");

        } finally {

            setLoading(false);

        }
    };

    const searchOrders = () => {
        setPage(1);
        getWorkOrders();
    };

    const clearFilters = () => {

        setPlate("");
        setStatus("");
        setPage(1);

        setTimeout(() => {
            getWorkOrders();
        }, 0);
    };

    const totalPages = Math.ceil(total / pageSize);

    if (loading) {
        return <h2 style={{ padding: "30px" }}>Cargando órdenes...</h2>;
    }

    if (error) {
        return <h2 style={{ padding: "30px" }}>{error}</h2>;
    }

    return (
        <div style={{ padding: "30px" }}>

            <h1>Órdenes de trabajo</h1>
            <button
                onClick={() => navigate("/work-orders/new")}
                style={{
                    padding: "10px 20px",
                    marginTop: "10px",
                    marginBottom: "20px"
                }}
            >
                Nueva orden
            </button>

            {/* FILTROS */}

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px",
                    marginBottom: "20px"
                }}
            >

                <input
                    type="text"
                    placeholder="Buscar por placa"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    style={{
                        padding: "10px",
                        width: "200px"
                    }}
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                        padding: "10px"
                    }}
                >

                    <option value="">
                        Todos los estados
                    </option>

                    <option value="RECIBIDA">
                        RECIBIDA
                    </option>

                    <option value="DIAGNOSTICO">
                        DIAGNOSTICO
                    </option>

                    <option value="EN_PROCESO">
                        EN PROCESO
                    </option>

                    <option value="LISTA">
                        LISTA
                    </option>

                    <option value="ENTREGADA">
                        ENTREGADA
                    </option>

                    <option value="CANCELADA">
                        CANCELADA
                    </option>

                </select>

                <button onClick={searchOrders}>
                    Buscar
                </button>

                <button onClick={clearFilters}>
                    Limpiar
                </button>

            </div>

            {/* TABLA */}

            {orders.length === 0 ? (

                <p>No se encontraron órdenes.</p>

            ) : (

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >

                    <thead>

                        <tr>

                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>Placa</th>
                            <th style={thStyle}>Cliente</th>
                            <th style={thStyle}>Estado</th>
                            <th style={thStyle}>Fecha</th>
                            <th style={thStyle}>Total</th>
                            <th style={thStyle}>Acciones</th>

                        </tr>

                    </thead>

                    <tbody>

                        {orders.map((order) => (

                            <tr key={order.id}>

                                <td style={tdStyle}>
                                    {order.id}
                                </td>

                                <td style={tdStyle}>
                                    {order.Bike?.plate}
                                </td>

                                <td style={tdStyle}>
                                    {order.Bike?.Client?.name}
                                </td>

                                <td style={tdStyle}>
                                    {order.status}
                                </td>

                                <td style={tdStyle}>
                                    {new Date(
                                        order.entryDate
                                    ).toLocaleDateString()}
                                </td>

                                <td style={tdStyle}>
                                    ${Number(order.total).toLocaleString()}
                                </td>

                                <td style={tdStyle}>

                                    <button
                                        onClick={() => navigate(`/work-orders/${order.id}`)}
                                    >
                                        Ver detalle
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            )}

            {/* PAGINACIÓN */}

            {totalPages > 1 && (

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        marginTop: "20px"
                    }}
                >

                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        Anterior
                    </button>

                    <span>
                        Página {page} de {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                    >
                        Siguiente
                    </button>

                </div>

            )}

        </div>
    );
}

const thStyle = {
    border: "1px solid #ddd",
    padding: "12px",
    backgroundColor: "#f2f2f2",
    textAlign: "left"
};

const tdStyle = {
    border: "1px solid #ddd",
    padding: "12px"
};

export default WorkOrders;