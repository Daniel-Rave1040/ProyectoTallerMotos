const express = require("express");
const {
    createWorkOrder,
    getWorkOrders,
    getWorkOrderById,
    updateWorkOrderStatus,
    addWorkOrderItem,
    deleteWorkOrderItem,
    getWorkOrderHistory
} = require("../controllers/workOrderController");
const { verifyToken, authorize } = require("../middleware/auth");

const router = express.Router();

// Todos los endpoints de órdenes requieren autenticación
router.use(verifyToken);

router.post("/", authorize(["ADMIN", "MECANICO"]), createWorkOrder);
router.get("/", authorize(["ADMIN", "MECANICO"]), getWorkOrders);
router.get("/:id", authorize(["ADMIN", "MECANICO"]), getWorkOrderById);
router.get("/:id/history", authorize(["ADMIN", "MECANICO"]), getWorkOrderHistory);
router.patch("/:id/status", authorize(["ADMIN", "MECANICO"]), updateWorkOrderStatus);
router.post("/:id/items", authorize(["ADMIN", "MECANICO"]), addWorkOrderItem);

// Solo ADMIN puede eliminar items
router.delete("/items/:itemId", authorize(["ADMIN"]), deleteWorkOrderItem);

module.exports = router;