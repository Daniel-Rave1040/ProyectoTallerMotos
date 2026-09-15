import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function WorkOrderDetail() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState("");

    const [statusNote, setStatusNote] = useState("");

    const [newStatus, setNewStatus] = useState("");
    const [message, setMessage] = useState("");
    const [changingStatus, setChangingStatus] = useState(false);

    // Datos del nuevo item
    const [type, setType] = useState("MANO_OBRA");
    const [description, setDescription] = useState("");
    const [count, setCount] = useState(1);
    const [unitValue, setUnitValue] = useState("");

    const [addingItem, setAddingItem] = useState(false);

    useEffect(() => {

        getWorkOrder();
        getHistory();

    }, []);

    const getWorkOrder = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(`/work-orders/${id}`);

            setOrder(response.data);

        } catch (error) {

            console.error(error);

            setError("No se pudo cargar la orden");

        } finally {

            setLoading(false);

        }
    };
    //obtener el historial
    const getHistory = async () => {

        try {

            setHistoryLoading(true);
            setHistoryError("");

            const response = await api.get(
                `/work-orders/${id}/history`
            );

            setHistory(response.data);

        } catch (error) {

            console.error(error);

            setHistoryError(
                "No se pudo cargar el historial"
            );

        } finally {

            setHistoryLoading(false);

        }
    };

    // CAMBIAR ESTADO

    const getNextStatuses = () => {

        if (!order) {
            return [];
        }

        const user = JSON.parse(
            localStorage.getItem("user") || "null"
        );

        const transitions = {
            RECIBIDA: ["DIAGNOSTICO", "CANCELADA"],
            DIAGNOSTICO: ["EN_PROCESO", "CANCELADA"],
            EN_PROCESO: ["LISTA", "CANCELADA"],
            LISTA: ["ENTREGADA", "CANCELADA"],
            ENTREGADA: [],
            CANCELADA: []
        };

        let nextStatuses =
            transitions[order.status] || [];

        if (user?.role === "MECANICO") {

            nextStatuses = nextStatuses.filter(
                (status) =>
                    ["DIAGNOSTICO", "EN_PROCESO", "LISTA"]
                        .includes(status)
            );

        }

        return nextStatuses;
    };

    const changeStatus = async () => {

        if (!newStatus) {
            setMessage("Selecciona un estado");
            return;
        }

        try {

            setChangingStatus(true);
            setMessage("");

            await api.patch(
                `/work-orders/${id}/status`,
                {
                    toStatus: newStatus,
                    note: statusNote || null
                }
            );

            setMessage("Estado actualizado correctamente");

            setNewStatus("");
            setStatusNote("");

            await getHistory();
            await getWorkOrder();

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "No se pudo cambiar el estado"
            );

        } finally {

            setChangingStatus(false);

        }
    };

    // AGREGAR ITEM

    const addItem = async () => {

        if (!description || !count || unitValue === "") {

            setMessage(
                "Completa todos los campos del item"
            );

            return;
        }

        if (Number(count) <= 0) {

            setMessage(
                "La cantidad debe ser mayor que 0"
            );

            return;
        }

        if (Number(unitValue) < 0) {

            setMessage(
                "El valor no puede ser negativo"
            );

            return;
        }

        try {

            setAddingItem(true);
            setMessage("");

            await api.post(
                `/work-orders/${id}/items`,
                {
                    type,
                    description,
                    count: Number(count),
                    unitValue: Number(unitValue)
                }
            );

            setMessage("Item agregado correctamente");

            // Limpiar formulario

            setDescription("");
            setCount(1);
            setUnitValue("");

            // Recargar orden

            await getWorkOrder();

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "No se pudo agregar el item"
            );

        } finally {

            setAddingItem(false);

        }
    };

    // ELIMINAR ITEM

    const deleteItem = async (itemId) => {

        const confirmDelete = window.confirm(
            "¿Seguro que quieres eliminar este item?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            setMessage("");

            await api.delete(
                `/work-orders/items/${itemId}`
            );

            setMessage("Item eliminado correctamente");

            await getWorkOrder();

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "No se pudo eliminar el item"
            );

        }
    };

    if (loading) {
        return (
            <h2 style={{ padding: "30px" }}>
                Cargando orden...
            </h2>
        );
    }

    if (error) {
        return (
            <h2 style={{ padding: "30px" }}>
                {error}
            </h2>
        );
    }

    if (!order) {
        return (
            <h2 style={{ padding: "30px" }}>
                Orden no encontrada
            </h2>
        );
    }

    const nextStatuses = getNextStatuses();

    return (
        <div style={{ padding: "30px" }}>

            <h1>
                Orden #{order.id}
            </h1>
            <button
                onClick={() => navigate("/work-orders")}
                style={{
                    padding: "10px 20px",
                    marginBottom: "20px"
                }}
            >
                ← Volver a órdenes
            </button>

            <hr />

            {/* MOTO */}

            <h2>Moto</h2>

            <p>
                <strong>Placa:</strong>{" "}
                {order.Bike?.plate}
            </p>

            <p>
                <strong>Marca:</strong>{" "}
                {order.Bike?.brand}
            </p>

            <p>
                <strong>Modelo:</strong>{" "}
                {order.Bike?.model}
            </p>

            <p>
                <strong>Cilindraje:</strong>{" "}
                {order.Bike?.cylinder || "No registrado"}
            </p>

            {/* CLIENTE */}

            <h2>Cliente</h2>

            <p>
                <strong>Nombre:</strong>{" "}
                {order.Bike?.Client?.name}
            </p>

            <p>
                <strong>Teléfono:</strong>{" "}
                {order.Bike?.Client?.phone}
            </p>

            <p>
                <strong>Email:</strong>{" "}
                {order.Bike?.Client?.email || "No registrado"}
            </p>

            {/* FALLA */}

            <h2>Descripción de la falla</h2>

            <p>
                {order.faultDescription}
            </p>

            {/* ESTADO */}

            <h2>Estado</h2>

            <p>
                <strong>Estado actual:</strong>{" "}
                {order.status}
            </p>

            {nextStatuses.length > 0 && (

                <div style={{ marginBottom: "20px" }}>

                    <select
                        value={newStatus}
                        onChange={(e) =>
                            setNewStatus(e.target.value)
                        }
                        style={{
                            padding: "10px",
                            marginRight: "10px"
                        }}
                    >

                        <option value="">
                            Seleccionar nuevo estado
                        </option>

                        {nextStatuses.map((status) => (

                            <option
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>

                        ))}

                    </select>
                    <input
                        type="text"
                        placeholder="Nota del cambio (opcional)"
                        value={statusNote}
                        onChange={(e) =>
                            setStatusNote(e.target.value)
                        }
                        maxLength={500}
                        style={{
                            padding: "10px",
                            marginRight: "10px",
                            marginTop: "10px",
                            width: "300px"
                        }}
                    />
                    <button
                        onClick={changeStatus}
                        disabled={changingStatus}
                    >
                        {changingStatus
                            ? "Cambiando..."
                            : "Cambiar estado"
                        }
                    </button>

                </div>

            )}

            {nextStatuses.length === 0 && (

                <p>
                    Esta orden no puede cambiar a otro estado.
                </p>

            )}

            {message && (

                <p>
                    <strong>{message}</strong>
                </p>

            )}
            {/* HISTORIAL */}

            <h2>
                Historial de estados
            </h2>

            {historyLoading && (
                <p>
                    Cargando historial...
                </p>
            )}

            {historyError && (
                <p style={{ color: "red" }}>
                    {historyError}
                </p>
            )}

            {!historyLoading &&
                !historyError &&
                history.length === 0 && (
                    <p>
                        No hay cambios de estado registrados.
                    </p>
                )
            }

            {!historyLoading &&
                history.length > 0 && (

                    <div
                        style={{
                            maxWidth: "700px",
                            marginBottom: "30px"
                        }}
                    >

                        {history.map((record) => (

                            <div
                                key={record.id}
                                style={{
                                    borderLeft: "3px solid #111827",
                                    paddingLeft: "15px",
                                    marginBottom: "20px"
                                }}
                            >

                                <p>
                                    <strong>
                                        {new Date(
                                            record.created_at
                                        ).toLocaleString()}
                                    </strong>
                                </p>

                                <p>
                                    <strong>
                                        {record.usuario?.name ||
                                            "Usuario desconocido"}
                                    </strong>

                                    {" · "}

                                    {record.usuario?.role}
                                </p>

                                <p>
                                    <strong>
                                        {record.from_status || "Inicio"}
                                    </strong>

                                    {" → "}

                                    <strong>
                                        {record.to_status}
                                    </strong>
                                </p>

                                {record.note && (
                                    <p>
                                        <strong>Nota:</strong>{" "}
                                        {record.note}
                                    </p>
                                )}

                            </div>

                        ))}

                    </div>
                )}

            {/* ITEMS */}

            <h2>Items</h2>

            {order.WorkOrderItems?.length === 0 ? (

                <p>
                    No hay items registrados.
                </p>

            ) : (

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >

                    <thead>

                        <tr>

                            <th style={thStyle}>
                                Tipo
                            </th>

                            <th style={thStyle}>
                                Descripción
                            </th>

                            <th style={thStyle}>
                                Cantidad
                            </th>

                            <th style={thStyle}>
                                Valor unitario
                            </th>

                            <th style={thStyle}>
                                Subtotal
                            </th>

                            <th style={thStyle}>
                                Acción
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {order.WorkOrderItems.map((item) => (

                            <tr key={item.id}>

                                <td style={tdStyle}>
                                    {item.type}
                                </td>

                                <td style={tdStyle}>
                                    {item.description}
                                </td>

                                <td style={tdStyle}>
                                    {item.count}
                                </td>

                                <td style={tdStyle}>
                                    ${Number(
                                        item.unitValue
                                    ).toLocaleString()}
                                </td>

                                <td style={tdStyle}>
                                    ${(
                                        Number(item.count) *
                                        Number(item.unitValue)
                                    ).toLocaleString()}
                                </td>

                                <td style={tdStyle}>

                                    <button
                                        onClick={() =>
                                            deleteItem(item.id)
                                        }
                                    >
                                        Eliminar
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            )}

            {/* AGREGAR ITEM */}

            <h2>
                Agregar item
            </h2>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    maxWidth: "400px"
                }}
            >

                <select
                    value={type}
                    onChange={(e) =>
                        setType(e.target.value)
                    }
                    style={{
                        padding: "10px"
                    }}
                >

                    <option value="MANO_OBRA">
                        MANO DE OBRA
                    </option>

                    <option value="REPUESTO">
                        REPUESTO
                    </option>

                </select>

                <input
                    type="text"
                    placeholder="Descripción"
                    value={description}
                    onChange={(e) =>
                        setDescription(e.target.value)
                    }
                    style={{
                        padding: "10px"
                    }}
                />

                <input
                    type="number"
                    placeholder="Cantidad"
                    value={count}
                    min="1"
                    onChange={(e) =>
                        setCount(e.target.value)
                    }
                    style={{
                        padding: "10px"
                    }}
                />

                <input
                    type="number"
                    placeholder="Valor unitario"
                    value={unitValue}
                    min="0"
                    onChange={(e) =>
                        setUnitValue(e.target.value)
                    }
                    style={{
                        padding: "10px"
                    }}
                />

                <button
                    onClick={addItem}
                    disabled={addingItem}
                >
                    {addingItem
                        ? "Agregando..."
                        : "Agregar item"
                    }
                </button>

            </div>

            {/* TOTAL */}

            <h2>
                Total: $
                {Number(order.total).toLocaleString()}
            </h2>

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

export default WorkOrderDetail;