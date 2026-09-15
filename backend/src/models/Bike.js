const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Bike = sequelize.define("Bike", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    plate: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    brand: {
        type: DataTypes.STRING,
        allowNull: false
    },

    model: {
        type: DataTypes.STRING,
        allowNull: false
    },

    cylinder: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: "bikes",
    timestamps: false
});

module.exports = Bike;