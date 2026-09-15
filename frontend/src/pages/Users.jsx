
import { useEffect, useState } from "react";
import api from "../services/api";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "MECANICO"
    });

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/users");
            setUsers(response.data.users || response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "No se pudieron cargar los usuarios."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleCreateUser = async (event) => {
        event.preventDefault();

        try {
            setError("");

            await api.post("/users", form);

            setForm({
                name: "",
                email: "",
                password: "",
                role: "MECANICO"
            });

            await loadUsers();
            alert("Usuario creado correctamente.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "No se pudo crear el usuario."
            );
        }
    };

    const changeRole = async (id, role) => {
        try {
            await api.patch(`/users/${id}/role`, { role });
            await loadUsers();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "No se pudo cambiar el rol."
            );
        }
    };

    const changeActive = async (id, active) => {
        try {
            await api.patch(`/users/${id}/active`, { active });
            await loadUsers();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "No se pudo cambiar el estado del usuario."
            );
        }
    };

    if (loading) {
        return <p>Cargando usuarios...</p>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Administración de usuarios</h1>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <section>
                <h2>Crear usuario</h2>

                <form onSubmit={handleCreateUser}>
                    <input
                        name="name"
                        placeholder="Nombre completo"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Correo electrónico"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                    >
                        <option value="MECANICO">Mecánico</option>
                        <option value="ADMIN">Administrador</option>
                    </select>

                    <button type="submit">
                        Crear usuario
                    </button>
                </form>
            </section>

            <hr />

            <section>
                <h2>Usuarios registrados</h2>

                {users.length === 0 ? (
                    <p>No hay usuarios registrados.</p>
                ) : (
                    <table border="1" cellPadding="8">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>

                                    <td>
                                        <select
                                            value={user.role}
                                            onChange={(event) =>
                                                changeRole(user.id, event.target.value)
                                            }
                                        >
                                            <option value="ADMIN">ADMIN</option>
                                            <option value="MECANICO">MECANICO</option>
                                        </select>
                                    </td>

                                    <td>
                                        {user.active ? "Activo" : "Inactivo"}
                                    </td>

                                    <td>
                                        <button
                                            onClick={() =>
                                                changeActive(user.id, !user.active)
                                            }
                                        >
                                            {user.active
                                                ? "Desactivar"
                                                : "Activar"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default Users;