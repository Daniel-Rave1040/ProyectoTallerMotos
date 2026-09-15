require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("../config/database");
const { User } = require("../models");

const seedAdmin = async () => {
    try {
        const password = process.env.INITIAL_ADMIN_PASSWORD;

        if (!password) {
            console.error("Error: La variable de entorno INITIAL_ADMIN_PASSWORD no está definida.");
            process.exit(1);
        }

        await sequelize.authenticate();
        await User.sync();

        const adminEmail = "admin@tallermotos.com";

        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log(`El usuario administrador (${adminEmail}) ya existe. No se registraron cambios.`);
            process.exit(0);
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const adminUser = await User.create({
            name: "Administrador",
            email: adminEmail,
            password_hash,
            role: "ADMIN",
            active: true
        });

        console.log(`Usuario administrador creado exitosamente con ID: ${adminUser.id}, Email: ${adminUser.email}, Rol: ${adminUser.role}`);
        process.exit(0);
    } catch (error) {
        console.error("Error al ejecutar el seed de administrador:", error.message);
        process.exit(1);
    }
};

seedAdmin();
