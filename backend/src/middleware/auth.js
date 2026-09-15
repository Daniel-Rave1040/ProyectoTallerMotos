const jwt = require("jsonwebtoken");
const { User } = require("../models");

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Acceso denegado. Token no proporcionado."
            });
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || "default_jwt_secret";

        const decoded = jwt.verify(token, secret);

        // Verificar que el usuario exista y esté activo
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ["password_hash"] }
        });

        if (!user) {
            return res.status(401).json({
                message: "Token no válido. Usuario no encontrado."
            });
        }

        if (!user.active) {
            return res.status(401).json({
                message: "Acceso denegado. Usuario inactivo."
            });
        }

        req.user = decoded;
        req.currentUser = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "El token ha expirado."
            });
        }
        return res.status(401).json({
            message: "Token no válido."
        });
    }
};

/**
 * Middleware para autorización basada en roles
 * @param {Array<string>|string} allowedRoles - Roles autorizados (e.g. ["ADMIN"], ["ADMIN", "MECANICO"])
 */
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                message: "Acceso denegado. Se requiere autenticación."
            });
        }

        const rolesArray = typeof allowedRoles === "string" ? [allowedRoles] : allowedRoles;

        if (rolesArray.length > 0 && !rolesArray.includes(req.user.role)) {
            return res.status(403).json({
                message: "Acceso denegado. No tienes permisos suficientes para realizar esta acción."
            });
        }

        next();
    };
};

module.exports = {
    verifyToken,
    authorize
};
