import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password
      });

      const { accessToken, user } = response.data;

      // Guardar token y datos del usuario en localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirigir a las órdenes de trabajo
      navigate("/work-orders");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Credenciales inválidas. Por favor intenta de nuevo.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Taller de Motos</h2>
          <p style={styles.subtitle}>Iniciar Sesión</p>
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tallermotos.com"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Autenticando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    padding: "20px"
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "32px",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    boxShadow: "var(--shadow)",
    textAlign: "left"
  },
  header: {
    marginBottom: "24px",
    textAlign: "center"
  },
  title: {
    fontSize: "24px",
    margin: "0 0 4px 0",
    color: "var(--text-h)"
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--text)"
  },
  errorMessage: {
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "6px",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#ef4444",
    fontSize: "14px",
    textAlign: "center"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--text-h)"
  },
  input: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--code-bg)",
    color: "var(--text-h)",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    width: "100%"
  },
  button: {
    marginTop: "8px",
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "var(--accent)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    transition: "background-color 0.2s"
  }
};

export default Login;
