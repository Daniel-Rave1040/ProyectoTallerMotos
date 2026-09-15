const { Client } = require("../models");

// CREAR CLIENTE
const createClient = async (req, res, next) => {
    try {
        const { name, phone, email } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                message: "El nombre y teléfono son obligatorios"
            });
        }

        const client = await Client.create({
            name,
            phone,
            email
        });

        res.status(201).json(client);

    } catch (error) {
        next(error);
    }
};


// OBTENER CLIENTES
const getClients = async (req, res, next) => {
    try {
        const { search } = req.query;

        let where = {};

        if (search) {
            const { Op } = require("sequelize");

            where = {
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        phone: {
                            [Op.like]: `%${search}%`
                        }
                    }
                ]
            };
        }

        const clients = await Client.findAll({
            where,
            order: [["id", "DESC"]]
        });

        res.json(clients);

    } catch (error) {
        next(error);
    }
};


// OBTENER UN CLIENTE
const getClientById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const client = await Client.findByPk(id);

        if (!client) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }

        res.json(client);

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createClient,
    getClients,
    getClientById
};