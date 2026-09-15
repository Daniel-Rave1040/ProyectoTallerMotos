const {
    WorkOrder,
    WorkOrderItem,
    Bike,
    Client,
    WorkOrderStatusHistory,
    User
} = require("../models");

const { Op } = require("sequelize");
const sequelize = require("../config/database");


// CREAR ORDEN
const createWorkOrder = async (req, res, next) => {
    try {
        const {
            motoId,
            faultDescription
        } = req.body;

        if (!motoId || !faultDescription) {
            return res.status(400).json({
                message: "La moto y la descripción de la falla son obligatorias"
            });
        }

        // Verificar que la moto exista
        const bike = await Bike.findByPk(motoId);

        if (!bike) {
            return res.status(400).json({
                message: "La moto no existe"
            });
        }

        const workOrder = await WorkOrder.create({
            motoId,
            faultDescription
        });

        res.status(201).json(workOrder);

    } catch (error) {
        next(error);
    }
};


// OBTENER ÓRDENES
const getWorkOrders = async (req, res, next) => {
    try {
        const {
            status,
            plate,
            page = 1,
            pageSize = 10
        } = req.query;

        const where = {};
        const bikeWhere = {};

        if (status) {
            where.status = status;
        }

        if (plate) {
            bikeWhere.plate = {
                [Op.like]: `%${plate}%`
            };
        }

        const limit = Number(pageSize);
        const offset = (Number(page) - 1) * limit;

        const result = await WorkOrder.findAndCountAll({
            where,
            limit,
            offset,
            include: [
                {
                    model: Bike,
                    where: plate ? bikeWhere : undefined,
                    include: [
                        {
                            model: Client
                        }
                    ]
                }
            ],
            order: [["id", "DESC"]]
        });

        res.json({
            total: result.count,
            page: Number(page),
            pageSize: limit,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
};


// OBTENER ORDEN POR ID
const getWorkOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const workOrder = await WorkOrder.findByPk(id, {
            include: [
                {
                    model: Bike,
                    include: [
                        {
                            model: Client
                        }
                    ]
                },
                {
                    model: WorkOrderItem
                },
                {
                    model: WorkOrderStatusHistory,
                    as: "statusHistory",
                    include: [
                        {
                            model: User,
                            as: "changedBy",
                            attributes: { exclude: ["password_hash"] }
                        }
                    ]
                }
            ],
            order: [
                [{ model: WorkOrderStatusHistory, as: "statusHistory" }, "created_at", "DESC"]
            ]
        });

        if (!workOrder) {
            return res.status(404).json({
                message: "Orden no encontrada"
            });
        }

        res.json(workOrder);

    } catch (error) {
        next(error);
    }
};


// CAMBIAR ESTADO CON HISTORIAL Y TRANSACCIÓN
const updateWorkOrderStatus = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const targetStatus = req.body.toStatus || req.body.status;
        const note = req.body.note || null;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        const validStatuses = [
            "RECIBIDA",
            "DIAGNOSTICO",
            "EN_PROCESO",
            "LISTA",
            "ENTREGADA",
            "CANCELADA"
        ];

        // Regla 3: Validar que toStatus sea un estado válido
        if (!targetStatus || !validStatuses.includes(targetStatus)) {
            await transaction.rollback();
            return res.status(400).json({
                message: "El estado destino no es válido"
            });
        }

        const workOrder = await WorkOrder.findByPk(id, { transaction });

        // Regla 404: Orden no encontrada
        if (!workOrder) {
            await transaction.rollback();
            return res.status(404).json({
                message: "Orden no encontrada"
            });
        }

        const currentStatus = workOrder.status;

        // Regla 9: Si la orden está ENTREGADA, ningún MECANICO puede modificarla
        if (userRole === "MECANICO" && currentStatus === "ENTREGADA") {
            await transaction.rollback();
            return res.status(403).json({
                message: "La orden ya fue entregada y no puede ser modificada por un mecánico"
            });
        }

        // Regla 8: Restricciones para MECANICO (solo DIAGNOSTICO, EN_PROCESO, LISTA; no ENTREGADA ni CANCELADA)
        if (userRole === "MECANICO") {
            const allowedMecanicoStatuses = ["DIAGNOSTICO", "EN_PROCESO", "LISTA"];
            if (!allowedMecanicoStatuses.includes(targetStatus)) {
                await transaction.rollback();
                return res.status(403).json({
                    message: `Los mecánicos no tienen permiso para cambiar el estado a ${targetStatus}`
                });
            }
        }

        // Regla 5: No permitir cambios idempotentes (e.g. EN_PROCESO -> EN_PROCESO) -> 400 Bad Request
        if (currentStatus === targetStatus) {
            await transaction.rollback();
            return res.status(400).json({
                message: `La orden ya se encuentra en el estado ${targetStatus}`
            });
        }

        // Regla 4: Matriz de transiciones válidas
        const validTransitions = {
            RECIBIDA: ["DIAGNOSTICO", "CANCELADA"],
            DIAGNOSTICO: ["EN_PROCESO", "CANCELADA"],
            EN_PROCESO: ["LISTA", "CANCELADA"],
            LISTA: ["ENTREGADA", "CANCELADA"],
            ENTREGADA: [],
            CANCELADA: []
        };

        if (!validTransitions[currentStatus].includes(targetStatus)) {
            await transaction.rollback();
            return res.status(400).json({
                message: `No se puede cambiar de ${currentStatus} a ${targetStatus}`
            });
        }

        // Regla 6 & 7: Actualización de la orden y creación del historial en UNA sola transacción
        workOrder.status = targetStatus;
        await workOrder.save({ transaction });

        const historyRecord = await WorkOrderStatusHistory.create({
            work_order_id: workOrder.id,
            from_status: currentStatus,
            to_status: targetStatus,
            note: note,
            changed_by_user_id: userId
        }, { transaction });

        await transaction.commit();

        return res.json({
            message: "Estado de la orden actualizado correctamente",
            workOrder,
            history: historyRecord
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


// AGREGAR ITEM
const addWorkOrderItem = async (req, res, next) => {

    const transaction = await sequelize.transaction();

    try {

        const { id } = req.params;

        const {
            type,
            description,
            count,
            unitValue
        } = req.body;

        const workOrder = await WorkOrder.findByPk(id, {
            transaction
        });

        if (!workOrder) {

            await transaction.rollback();

            return res.status(404).json({
                message: "Orden no encontrada"
            });

        }

        if (!type || !description || count === undefined || unitValue === undefined) {

            await transaction.rollback();

            return res.status(400).json({
                message: "Todos los campos del item son obligatorios"
            });

        }

        if (!["MANO_OBRA", "REPUESTO"].includes(type)) {

            await transaction.rollback();

            return res.status(400).json({
                message: "El tipo debe ser MANO_OBRA o REPUESTO"
            });

        }

        if (
            !Number.isInteger(Number(count)) ||
            Number(count) <= 0
        ) {
            await transaction.rollback();

            return res.status(400).json({
                message: "La cantidad debe ser un número entero mayor que 0"
            });
        }

        if (
            isNaN(Number(unitValue)) ||
            Number(unitValue) < 0
        ) {
            await transaction.rollback();

            return res.status(400).json({
                message: "El valor unitario debe ser un número mayor o igual a 0"
            });
        }

        const item = await WorkOrderItem.create({

            work_order_id: id,
            type,
            description,
            count,
            unitValue

        }, {
            transaction
        });

        const items = await WorkOrderItem.findAll({
            where: {
                work_order_id: id
            },
            transaction
        });

        let total = 0;

        items.forEach((item) => {

            total +=
                Number(item.count) *
                Number(item.unitValue);

        });

        workOrder.total = total;

        await workOrder.save({
            transaction
        });

        await transaction.commit();

        res.status(201).json({
            item,
            total
        });

    } catch (error) {

        await transaction.rollback();

        next(error);

    }
};


// ELIMINAR ITEM
const deleteWorkOrderItem = async (req, res, next) => {

    const transaction = await sequelize.transaction();

    try {

        const { itemId } = req.params;

        const item = await WorkOrderItem.findByPk(itemId, {
            transaction
        });

        if (!item) {

            await transaction.rollback();

            return res.status(404).json({
                message: "Item no encontrado"
            });

        }

        const workOrderId = item.work_order_id;

        await item.destroy({
            transaction
        });

        const items = await WorkOrderItem.findAll({
            where: {
                work_order_id: workOrderId
            },
            transaction
        });

        let total = 0;

        items.forEach((item) => {

            total +=
                Number(item.count) *
                Number(item.unitValue);

        });

        await WorkOrder.update(
            {
                total
            },
            {
                where: {
                    id: workOrderId
                },
                transaction
            }
        );

        await transaction.commit();

        res.json({
            message: "Item eliminado correctamente",
            total
        });

    } catch (error) {

        await transaction.rollback();

        next(error);

    }
};


// OBTENER HISTORIAL DE ESTADOS DE UNA ORDEN
const getWorkOrderHistory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const workOrder = await WorkOrder.findByPk(id);

        if (!workOrder) {
            return res.status(404).json({
                message: "Orden no encontrada"
            });
        }

        const history = await WorkOrderStatusHistory.findAll({
            where: {
                work_order_id: id
            },
            order: [["created_at", "DESC"]],
            include: [
                {
                    model: User,
                    as: "changedBy",
                    attributes: ["id", "name", "role"]
                }
            ],
            attributes: ["id", "from_status", "to_status", "note", "created_at"]
        });

        const formattedHistory = history.map((record) => ({
            id: record.id,
            from_status: record.from_status,
            to_status: record.to_status,
            note: record.note,
            created_at: record.created_at,
            usuario: record.changedBy ? {
                id: record.changedBy.id,
                name: record.changedBy.name,
                role: record.changedBy.role
            } : null
        }));

        res.json(formattedHistory);

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createWorkOrder,
    getWorkOrders,
    getWorkOrderById,
    updateWorkOrderStatus,
    addWorkOrderItem,
    deleteWorkOrderItem,
    getWorkOrderHistory
};