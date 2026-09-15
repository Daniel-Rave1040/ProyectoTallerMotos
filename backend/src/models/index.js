const Client = require("./Client");
const Bike = require("./Bike");
const WorkOrder = require("./WorkOrder");
const WorkOrderItem = require("./WorkOrderItem");
const User = require("./User");
const WorkOrderStatusHistory = require("./WorkOrderStatusHistory");

// Cliente tiene muchas motos
Client.hasMany(Bike, {
    foreignKey: "clientId"
});

Bike.belongsTo(Client, {
    foreignKey: "clientId"
});

// Moto tiene muchas órdenes
Bike.hasMany(WorkOrder, {
    foreignKey: "motoId"
});

WorkOrder.belongsTo(Bike, {
    foreignKey: "motoId"
});

// Orden tiene muchos items
WorkOrder.hasMany(WorkOrderItem, {
    foreignKey: "work_order_id"
});

WorkOrderItem.belongsTo(WorkOrder, {
    foreignKey: "work_order_id"
});

// Orden tiene muchos registros en el historial de estados
WorkOrder.hasMany(WorkOrderStatusHistory, {
    foreignKey: "work_order_id",
    as: "statusHistory"
});

WorkOrderStatusHistory.belongsTo(WorkOrder, {
    foreignKey: "work_order_id"
});

// Usuario genera muchos registros en el historial de estados
User.hasMany(WorkOrderStatusHistory, {
    foreignKey: "changed_by_user_id"
});

WorkOrderStatusHistory.belongsTo(User, {
    foreignKey: "changed_by_user_id",
    as: "changedBy"
});

module.exports = {
    Client,
    Bike,
    WorkOrder,
    WorkOrderItem,
    User,
    WorkOrderStatusHistory
};