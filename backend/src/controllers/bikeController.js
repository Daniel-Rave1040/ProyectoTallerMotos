const { Bike, Client } = require("../models");
const { Op } = require("sequelize");

// CREAR MOTO
const createBike = async (req, res, next) => {
    try {
        const {
            plate,
            brand,
            model,
            cylinder,
            clientId
        } = req.body;

        if (!plate || !brand || !model || !clientId) {
            return res.status(400).json({
                message: "Placa, marca, modelo y cliente son obligatorios"
            });
        }

        // Verificar que el cliente exista
        const client = await Client.findByPk(clientId);

        if (!client) {
            return res.status(400).json({
                message: "El cliente no existe"
            });
        }

        // Verificar placa
        const existingBike = await Bike.findOne({
            where: {
                plate
            }
        });

        if (existingBike) {
            return res.status(400).json({
                message: "La placa ya está registrada"
            });
        }

        const bike = await Bike.create({
            plate,
            brand,
            model,
            cylinder,
            clientId
        });

        res.status(201).json(bike);

    } catch (error) {
        next(error);
    }
};


// OBTENER MOTOS
const getBikes = async (req, res, next) => {
    try {
        const { plate } = req.query;

        const where = {};

        if (plate) {
            where.plate = {
                [Op.like]: `%${plate}%`
            };
        }

        const bikes = await Bike.findAll({
            where,
            include: [
                {
                    model: Client
                }
            ],
            order: [["id", "DESC"]]
        });

        res.json(bikes);

    } catch (error) {
        next(error);
    }
};


// OBTENER MOTO POR ID
const getBikeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const bike = await Bike.findByPk(id, {
            include: [
                {
                    model: Client
                }
            ]
        });

        if (!bike) {
            return res.status(404).json({
                message: "Moto no encontrada"
            });
        }

        res.json(bike);

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createBike,
    getBikes,
    getBikeById
};