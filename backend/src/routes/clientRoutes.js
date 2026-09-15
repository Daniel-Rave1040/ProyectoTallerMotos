const express = require("express");
const {
    createClient,
    getClients,
    getClientById
} = require("../controllers/clientController");
const { verifyToken, authorize } = require("../middleware/auth");

const router = express.Router();

// Todos los endpoints de clientes requieren autenticación
router.use(verifyToken);

router.post("/", authorize(["ADMIN", "MECANICO"]), createClient);
router.get("/", authorize(["ADMIN", "MECANICO"]), getClients);
router.get("/:id", authorize(["ADMIN", "MECANICO"]), getClientById);

module.exports = router;