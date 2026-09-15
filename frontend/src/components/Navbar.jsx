import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <nav style={styles.navbar}>

            <div style={styles.brand}>
                Taller de Motos
            </div>

            <div style={styles.links}>

                <Link to="/" style={styles.link}>
                    Inicio
                </Link>

                <Link to="/work-orders" style={styles.link}>
                    Órdenes
                </Link>

                <Link to="/work-orders/new" style={styles.link}>
                    Nueva orden
                </Link>

                {user?.role === "ADMIN" && (
                    <Link to="/users" style={styles.link}>
                        Usuarios
                    </Link>
                )}

            </div>

            <div style={styles.userSection}>

                {user && (
                    <div style={styles.userInfo}>
                        <strong>{user.name}</strong>
                        <span>{user.role}</span>
                    </div>
                )}

                <button
                    onClick={logout}
                    style={styles.logoutButton}
                >
                    Cerrar sesión
                </button>

            </div>

        </nav>
    );
}

const styles = {

    navbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        padding: "15px 25px",
        backgroundColor: "#111827",
        color: "#ffffff",
        boxSizing: "border-box",
        width: "100%"
    },

    brand: {
        fontSize: "20px",
        fontWeight: "bold",
        whiteSpace: "nowrap"
    },

    links: {
        display: "flex",
        gap: "18px",
        alignItems: "center",
        flex: 1,
        justifyContent: "center"
    },

    link: {
        color: "#ffffff",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "500"
    },

    userSection: {
        display: "flex",
        alignItems: "center",
        gap: "15px"
    },

    userInfo: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        fontSize: "12px"
    },

    logoutButton: {
        padding: "8px 12px",
        border: "1px solid #ffffff",
        borderRadius: "6px",
        backgroundColor: "transparent",
        color: "#ffffff",
        cursor: "pointer"
    }

};

export default Navbar;