require("dotenv").config();

const bcrypt = require("bcrypt");
const sequelize = require("../config/database");
const { User } = require("../models");

const seedMechanic = async () => {
    try {
        await sequelize.authenticate();
        await User.sync();

        const mechanicEmail = "mecanico@tallermotos.com";
        const password = "Mecanico123!";

        const existingMechanic = await User.findOne({
            where: { email: mechanicEmail }
        });

        if (existingMechanic) {
            console.log(`El usuario mecánico (${mechanicEmail}) ya existe.`);
            process.exit(0);
        }

        const password_hash = await bcrypt.hash(password, 10);

        const mechanic = await User.create({
            name: "Mecánico Prueba",
            email: mechanicEmail,
            password_hash,
            role: "MECANICO",
            active: true
        });

        console.log("Usuario mecánico creado correctamente.");
        console.log(`ID: ${mechanic.id}`);
        console.log(`Email: ${mechanic.email}`);
        console.log(`Rol: ${mechanic.role}`);

        process.exit(0);
    } catch (error) {
        console.error("Error creando usuario mecánico:", error.message);
        process.exit(1);
    }
};

seedMechanic();