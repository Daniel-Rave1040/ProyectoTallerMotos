const bcrypt = require("bcrypt");
const { User } = require("../models");

const publicUserAttributes = [
    "id",
    "name",
    "email",
    "role",
    "active",
    "created_at",
    "updated_at"
];

const getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: publicUserAttributes,
            order: [["id", "ASC"]]
        });

        res.json(users);
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Nombre, email, contraseña y rol son obligatorios."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "La contraseña debe tener mínimo 8 caracteres."
            });
        }

        if (!["ADMIN", "MECANICO"].includes(role)) {
            return res.status(400).json({
                message: "El rol debe ser ADMIN o MECANICO."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "El email no tiene un formato válido."
            });
        }

        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Ya existe un usuario con ese email."
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password_hash,
            role,
            active: true
        });

        const responseUser = await User.findByPk(user.id, {
            attributes: publicUserAttributes
        });

        res.status(201).json(responseUser);
    } catch (error) {
        next(error);
    }
};

const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["ADMIN", "MECANICO"].includes(role)) {
            return res.status(400).json({
                message: "El rol debe ser ADMIN o MECANICO."
            });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado."
            });
        }

        user.role = role;
        await user.save();

        const responseUser = await User.findByPk(id, {
            attributes: publicUserAttributes
        });

        res.json(responseUser);
    } catch (error) {
        next(error);
    }
};

const updateUserActive = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        if (typeof active !== "boolean") {
            return res.status(400).json({
                message: "El campo active debe ser booleano."
            });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado."
            });
        }

        user.active = active;
        await user.save();

        const responseUser = await User.findByPk(id, {
            attributes: publicUserAttributes
        });

        res.json(responseUser);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUserRole,
    updateUserActive
};