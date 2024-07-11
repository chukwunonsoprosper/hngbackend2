const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Organisation = require('./organisation');

// Define the association with through table 'UserOrganisations'
const UserOrganisation = sequelize.define('UserOrganisation', {
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  UserUserId: {
    type: DataTypes.UUID, // Adjust as needed, considering your database schema
    references: {
      model: 'Users',
      key: 'userId'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    allowNull: false
  },
  OrganisationOrgId: {
    type: DataTypes.UUID, // Adjust as needed, considering your database schema
    references: {
      model: 'Organisations',
      key: 'orgId'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    allowNull: false
  }
});

// Define many-to-many relationships with correct foreign key types
User.belongsToMany(Organisation, { through: UserOrganisation, foreignKey: 'UserUserId' });
Organisation.belongsToMany(User, { through: UserOrganisation, foreignKey: 'OrganisationOrgId' });

module.exports = {
  sequelize,
  User,
  Organisation,
  UserOrganisation // Export the UserOrganisation model if needed for direct queries
};
