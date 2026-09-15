import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateWorkOrder() {

    const navigate = useNavigate();

    // Motos
    const [bikes, setBikes] = useState([]);
    const [motoId, setMotoId] = useState("");

    // Clientes
    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState("");

    // Orden
    const [faultDescription, setFaultDescription] = useState("");

    // Estados
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    // Formularios
    const [showClientForm, setShowClientForm] = useState(false);
    const [showBikeForm, setShowBikeForm] = useState(false);

    // Nuevo cliente
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientEmail, setClientEmail] = useState("");

    const [creatingClient, setCreatingClient] = useState(false);

    // Nueva moto
    const [bikePlate, setBikePlate] = useState("");
    const [bikeBrand, setBikeBrand] = useState("");
    const [bikeModel, setBikeModel] = useState("");
    const [bikeCylinder, setBikeCylinder] = useState("");

    const [creatingBike, setCreatingBike] = useState(false);

    // CARGAR DATOS

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [bikesResponse, clientsResponse] =
                await Promise.all([
                    api.get("/bikes"),
                    api.get("/clients")
                ]);

            setBikes(bikesResponse.data);
            setClients(clientsResponse.data);

        } catch (error) {

            console.error(error);

            setError("No se pudieron cargar los datos");

        } finally {

            setLoading(false);

        }
    };

    // CREAR CLIENTE

    const createClient = async () => {

        if (!clientName.trim()) {
            setError("El nombre del cliente es obligatorio");
            return;
        }

        if (!clientPhone.trim()) {
            setError("El teléfono del cliente es obligatorio");
            return;
        }

        try {

            setCreatingClient(true);
            setError("");

            const response = await api.post(
                "/clients",
                {
                    name: clientName,
                    phone: clientPhone,
                    email: clientEmail || null
                }
            );

            const newClient = response.data;

            // Agregar el cliente a la lista

            setClients((previousClients) => [
                newClient,
                ...previousClients
            ]);

            // Seleccionar automáticamente el cliente

            setClientId(newClient.id);

            // Limpiar formulario

            setClientName("");
            setClientPhone("");
            setClientEmail("");

            setShowClientForm(false);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "No se pudo crear el cliente"
            );

        } finally {

            setCreatingClient(false);

        }
    };

    // CREAR MOTO

    const createBike = async () => {

        if (!clientId) {
            setError("Primero debes seleccionar un cliente");
            return;
        }

        if (!bikePlate.trim()) {
            setError("La placa es obligatoria");
            return;
        }

        if (!bikeBrand.trim()) {
            setError("La marca es obligatoria");
            return;
        }

        if (!bikeModel.trim()) {
            setError("El modelo es obligatorio");
            return;
        }

        try {

            setCreatingBike(true);
            setError("");

            const response = await api.post(
                "/bikes",
                {
                    plate: bikePlate,
                    brand: bikeBrand,
                    model: bikeModel,
                    cylinder: bikeCylinder
                        ? Number(bikeCylinder)
                        : null,
                    clientId: Number(clientId)
                }
            );

            const newBike = response.data;

            // Agregar la moto a la lista

            setBikes((previousBikes) => [
                newBike,
                ...previousBikes
            ]);

            // Seleccionar automáticamente la moto

            setMotoId(newBike.id);

            // Limpiar formulario

            setBikePlate("");
            setBikeBrand("");
            setBikeModel("");
            setBikeCylinder("");

            setShowBikeForm(false);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "No se pudo crear la moto"
            );

        } finally {

            setCreatingBike(false);

        }
    };

    // CREAR ORDEN

    const createOrder = async () => {

        if (!motoId) {
            setError("Debes seleccionar una moto");
            return;
        }

        if (!faultDescription.trim()) {
            setError("Debes escribir la descripción de la falla");
            return;
        }

        try {

            setCreating(true);
            setError("");

            const response = await api.post(
                "/work-orders",
                {
                    motoId: Number(motoId),
                    faultDescription: faultDescription
                }
            );

            navigate(`/work-orders/${response.data.id}`);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "No se pudo crear la orden"
            );

        } finally {

            setCreating(false);

        }
    };

    // MOTO SELECCIONADA

    const selectedBike = bikes.find(
        (bike) => bike.id === Number(motoId)
    );

    // CLIENTE SELECCIONADO

    const selectedClient = clients.find(
        (client) => client.id === Number(clientId)
    );

    if (loading) {

        return (
            <h2 style={{ padding: "30px" }}>
                Cargando datos...
            </h2>
        );

    }

    return (
        <div style={{ padding: "30px" }}>

            <h1>
                Nueva orden de trabajo
            </h1>

            <hr />

            {error && (
                <p style={{ color: "red" }}>
                    <strong>{error}</strong>
                </p>
            )}

            {/* CLIENTE */}

            <h2>
                Cliente
            </h2>

            <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{
                    padding: "10px",
                    width: "350px"
                }}
            >

                <option value="">
                    Seleccionar cliente
                </option>

                {clients.map((client) => (

                    <option
                        key={client.id}
                        value={client.id}
                    >
                        {client.name} - {client.phone}
                    </option>

                ))}

            </select>

            <br />
            <br />

            <button
                onClick={() => {
                    setShowClientForm(!showClientForm);
                    setError("");
                }}
                style={{
                    padding: "10px 20px",
                    marginBottom: "15px"
                }}
            >
                {showClientForm
                    ? "Cancelar"
                    : "Registrar nuevo cliente"
                }
            </button>

            {/* FORMULARIO CLIENTE */}

            {showClientForm && (

                <div
                    style={{
                        padding: "20px",
                        border: "1px solid #ddd",
                        maxWidth: "500px",
                        marginBottom: "25px"
                    }}
                >

                    <h3>
                        Nuevo cliente
                    </h3>

                    <input
                        type="text"
                        placeholder="Nombre"
                        value={clientName}
                        onChange={(e) =>
                            setClientName(e.target.value)
                        }
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        placeholder="Teléfono"
                        value={clientPhone}
                        onChange={(e) =>
                            setClientPhone(e.target.value)
                        }
                        style={inputStyle}
                    />

                    <input
                        type="email"
                        placeholder="Email (opcional)"
                        value={clientEmail}
                        onChange={(e) =>
                            setClientEmail(e.target.value)
                        }
                        style={inputStyle}
                    />

                    <button
                        onClick={createClient}
                        disabled={creatingClient}
                        style={{
                            padding: "10px 20px"
                        }}
                    >
                        {creatingClient
                            ? "Creando cliente..."
                            : "Crear cliente"
                        }
                    </button>

                </div>

            )}

            {selectedClient && (

                <div
                    style={{
                        padding: "15px",
                        border: "1px solid #ddd",
                        maxWidth: "500px",
                        marginBottom: "25px"
                    }}
                >

                    <h3>
                        Cliente seleccionado
                    </h3>

                    <p>
                        <strong>Nombre:</strong>{" "}
                        {selectedClient.name}
                    </p>

                    <p>
                        <strong>Teléfono:</strong>{" "}
                        {selectedClient.phone}
                    </p>

                    <p>
                        <strong>Email:</strong>{" "}
                        {selectedClient.email || "No registrado"}
                    </p>

                </div>

            )}

            {/* MOTO */}

            <h2>
                Moto
            </h2>

            <button
                onClick={() => {
                    if (!clientId) {
                        setError(
                            "Primero selecciona o registra un cliente"
                        );
                        return;
                    }

                    setShowBikeForm(!showBikeForm);
                    setError("");
                }}
                style={{
                    padding: "10px 20px",
                    marginBottom: "15px"
                }}
            >
                {showBikeForm
                    ? "Cancelar"
                    : "Registrar nueva moto"
                }
            </button>

            <br />

            <select
                value={motoId}
                onChange={(e) => setMotoId(e.target.value)}
                style={{
                    padding: "10px",
                    width: "350px"
                }}
            >

                <option value="">
                    Seleccionar una moto
                </option>

                {bikes.map((bike) => (

                    <option
                        key={bike.id}
                        value={bike.id}
                    >
                        {bike.plate} - {bike.brand} {bike.model}
                    </option>

                ))}

            </select>

            {/* FORMULARIO MOTO */}

            {showBikeForm && (

                <div
                    style={{
                        padding: "20px",
                        border: "1px solid #ddd",
                        maxWidth: "500px",
                        marginTop: "20px",
                        marginBottom: "25px"
                    }}
                >

                    <h3>
                        Nueva moto
                    </h3>

                    <input
                        type="text"
                        placeholder="Placa"
                        value={bikePlate}
                        onChange={(e) =>
                            setBikePlate(e.target.value)
                        }
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        placeholder="Marca"
                        value={bikeBrand}
                        onChange={(e) =>
                            setBikeBrand(e.target.value)
                        }
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        placeholder="Modelo"
                        value={bikeModel}
                        onChange={(e) =>
                            setBikeModel(e.target.value)
                        }
                        style={inputStyle}
                    />

                    <input
                        type="number"
                        placeholder="Cilindraje (opcional)"
                        value={bikeCylinder}
                        onChange={(e) =>
                            setBikeCylinder(e.target.value)
                        }
                        style={inputStyle}
                    />

                    <button
                        onClick={createBike}
                        disabled={creatingBike}
                        style={{
                            padding: "10px 20px"
                        }}
                    >
                        {creatingBike
                            ? "Creando moto..."
                            : "Crear moto"
                        }
                    </button>

                </div>

            )}

            {/* INFORMACIÓN MOTO */}

            {selectedBike && (

                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        border: "1px solid #ddd",
                        maxWidth: "500px"
                    }}
                >

                    <h3>
                        Información de la moto
                    </h3>

                    <p>
                        <strong>Placa:</strong>{" "}
                        {selectedBike.plate}
                    </p>

                    <p>
                        <strong>Marca:</strong>{" "}
                        {selectedBike.brand}
                    </p>

                    <p>
                        <strong>Modelo:</strong>{" "}
                        {selectedBike.model}
                    </p>

                    <p>
                        <strong>Cilindraje:</strong>{" "}
                        {selectedBike.cylinder || "No registrado"}
                    </p>

                    <h3>
                        Cliente de la moto
                    </h3>

                    <p>
                        <strong>Nombre:</strong>{" "}
                        {selectedBike.Client?.name}
                    </p>

                    <p>
                        <strong>Teléfono:</strong>{" "}
                        {selectedBike.Client?.phone}
                    </p>

                </div>

            )}

            {/* FALLA */}

            <h2>
                Descripción de la falla
            </h2>

            <textarea
                value={faultDescription}
                onChange={(e) =>
                    setFaultDescription(e.target.value)
                }
                placeholder="Describe la falla que presenta la moto"
                rows="5"
                style={{
                    padding: "10px",
                    width: "500px",
                    maxWidth: "100%"
                }}
            />

            <br />
            <br />

            {/* BOTONES */}

            <button
                onClick={createOrder}
                disabled={creating}
                style={{
                    padding: "10px 20px"
                }}
            >
                {creating
                    ? "Creando orden..."
                    : "Crear orden"
                }
            </button>

            <button
                onClick={() => navigate("/work-orders")}
                style={{
                    padding: "10px 20px",
                    marginLeft: "10px"
                }}
            >
                Cancelar
            </button>

        </div>
    );
}

const inputStyle = {
    display: "block",
    padding: "10px",
    width: "100%",
    marginBottom: "10px",
    boxSizing: "border-box"
};

export default CreateWorkOrder;
