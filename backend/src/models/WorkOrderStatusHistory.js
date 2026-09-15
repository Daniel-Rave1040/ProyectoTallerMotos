const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WorkOrderStatusHistory = sequelize.define("WorkOrderStatusHistory", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    work_order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    from_status: {
        type: DataTypes.ENUM("RECIBIDA", "DIAGNOSTICO", "EN_PROCESO", "LISTA", "ENTREGADA", "CANCELADA"),
        allowNull: true
    },
    to_status: {
        type: DataTypes.ENUM("RECIBIDA", "DIAGNOSTICO", "EN_PROCESO", "LISTA", "ENTREGADA", "CANCELADA"),
        allowNull: false
    },
    note: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    changed_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "work_order_status_history",
    timestamps: false,
    indexes: [
        {
            name: "idx_work_order_status_history_wo_created",
            fields: [
                "work_order_id",
                { attribute: "created_at", order: "DESC" }
            ]
        }
    ]
});

module.exports = WorkOrderStatusHistory;
