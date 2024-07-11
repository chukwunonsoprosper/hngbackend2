'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserOrganisations', {
      UserUserId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userId',
          deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        primaryKey: true
      },
      OrganisationOrgId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Organisations',
          key: 'orgId',
          deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        primaryKey: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserOrganisations');
  }
};
