const { Sequelize } = require('sequelize');
const UserModel = require('./user');
const OrganizationModel = require('./organization');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false
});

const User = UserModel(sequelize);
const Organization = OrganizationModel(sequelize);

User.belongsToMany(Organization, { through: 'UserOrganizations' });
Organization.belongsToMany(User, { through: 'UserOrganizations' });

module.exports = {
  sequelize,
  User,
  Organization,
};