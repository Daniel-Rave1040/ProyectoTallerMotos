require("dotenv").config();

const express = require("express");
const cors = require("cors");

const sequelize = require("./src/config/database");
require("./src/models");

const userRoutes = require("./src/routes/userRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const bikeRoutes = require("./src/routes/bikeRoutes");
const workOrderRoutes = require("./src/routes/workOrderRoutes");
const authRoutes = require("./src/routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/work-orders", workOrderRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "API Taller de Motos funcionando"
    });
});

// MIDDLEWARE GLOBAL DE ERRORES

app.use((error, req, res, next) => {

    console.error(error);

    res.status(error.status || 500).json({
        message: error.message || "Error interno del servidor"
    });

});

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
    .then(() => {

        console.log("MySQL conectado correctamente");

        app.listen(PORT, () => {
            console.log(
                `Servidor ejecutándose en http://localhost:${PORT}`
            );
        });

    })
    .catch((error) => {

        console.error(
            "Error conectando a MySQL:",
            error
        );

    });