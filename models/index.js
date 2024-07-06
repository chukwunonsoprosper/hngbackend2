const { Sequelize } = require('sequelize');
const UserModel = require('./user');
const OrganizationModel = require('./organization');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
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