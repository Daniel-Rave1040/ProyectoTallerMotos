const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WorkOrderItem = sequelize.define("WorkOrderItem", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    type: {
        type: DataTypes.ENUM("MANO_OBRA", "REPUESTO"),
        allowNull: false
    },

    description: {
        type: DataTypes.STRING,
        allowNull: false
    },

    count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },

    unitValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    tableName: "work_order_items",
    timestamps: false
});

module.exports = WorkOrderItem;