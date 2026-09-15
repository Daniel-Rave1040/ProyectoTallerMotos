const express = require("express");
const {
    createBike,
    getBikes,
    getBikeById
} = require("../controllers/bikeController");
const { verifyToken, authorize } = require("../middleware/auth");

const router = express.Router();

// Todos los endpoints de motos requieren autenticación
router.use(verifyToken);

router.post("/", authorize(["ADMIN", "MECANICO"]), createBike);
router.get("/", authorize(["ADMIN", "MECANICO"]), getBikes);
router.get("/:id", authorize(["ADMIN", "MECANICO"]), getBikeById);

module.exports = router;