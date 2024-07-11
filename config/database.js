const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with the connection string from the environment variable
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

module.exports = sequelize;
