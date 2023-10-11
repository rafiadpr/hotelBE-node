'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify the data type of the column to ENUM with the specified values.
    await queryInterface.changeColumn('user', 'role', {
      type: Sequelize.ENUM('Admin', 'Resepsionis'),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // To revert the changes, you can change the column type back to its original type.
    await queryInterface.changeColumn('user', 'role', {
      type: Sequelize.STRING, // Assuming it was originally a string.
      allowNull: false,
    });
  }
};
