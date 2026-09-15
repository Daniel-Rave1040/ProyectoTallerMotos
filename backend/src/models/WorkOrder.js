const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WorkOrder = sequelize.define("WorkOrder", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    entryDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    faultDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM(
            "RECIBIDA",
            "DIAGNOSTICO",
            "EN_PROCESO",
            "LISTA",
            "ENTREGADA",
            "CANCELADA"
        ),
        defaultValue: "RECIBIDA"
    },

    total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    }
}, {
    tableName: "work_orders",
    timestamps: false
});

module.exports = WorkOrder;