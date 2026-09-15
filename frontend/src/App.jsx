import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import WorkOrders from "./pages/WorkOrders";
import WorkOrderDetail from "./pages/WorkOrderDetail";
import CreateWorkOrder from "./pages/CreateWorkOrder";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Users from "./pages/Users";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Ruta pública */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/work-orders"
          element={
            <ProtectedRoute>
              <WorkOrders />
            </ProtectedRoute>
          }
        />

        {/* Nueva orden debe ir antes de :id */}
        <Route
          path="/work-orders/new"
          element={
            <ProtectedRoute>
              <CreateWorkOrder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/work-orders/:id"
          element={
            <ProtectedRoute>
              <WorkOrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;