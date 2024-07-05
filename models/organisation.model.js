const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Organisation = sequelize.define('Organisation', {
  orgId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  }
});

module.exports = Organisation;
