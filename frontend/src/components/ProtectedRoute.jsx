import { Navigate } from "react-router-dom";
import Navbar from "./Navbar";

function ProtectedRoute({ children, allowedRoles }) {

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    (!user || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />

      {children}

    </>
  );
}

export default ProtectedRoute;