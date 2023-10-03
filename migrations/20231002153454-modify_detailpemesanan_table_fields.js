'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('detailpemesanan', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
    });

    await queryInterface.addColumn('detailpemesanan', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
