const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email y contraseña son requeridos"
            });
        }

        const user = await User.findOne({ where: { email } });

        // Mensaje genérico de credenciales inválidas para no revelar existencia del email
        if (!user) {
            return res.status(401).json({
                message: "Credenciales inválidas"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Credenciales inválidas"
            });
        }

        if (!user.active) {
            return res.status(401).json({
                message: "Usuario inactivo. Contacte al administrador."
            });
        }

        const secret = process.env.JWT_SECRET || "default_jwt_secret";
        const tokenPayload = {
            id: user.id,
            role: user.role,
            email: user.email
        };

        const accessToken = jwt.sign(tokenPayload, secret, {
            expiresIn: "1h"
        });

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            active: user.active,
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        return res.json({
            accessToken,
            user: userData
        });
    } catch (error) {
        next(error);
    }
};

const me = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ["password_hash"] }
        });

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        return res.json({
            user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    me
};
