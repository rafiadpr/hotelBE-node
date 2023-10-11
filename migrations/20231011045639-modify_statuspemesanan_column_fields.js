'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify the data type of the column to ENUM with the specified values.
    await queryInterface.changeColumn('pemesanan', 'status_pemesanan', {
      type: Sequelize.ENUM('baru', 'check_in', 'check_out'),
      allowNull: false,
      defaultValue: 'baru', // You can specify a default value if needed.
    });
  },

  down: async (queryInterface, Sequelize) => {
    // To revert the changes, you can change the column type back to its original type.
    await queryInterface.changeColumn('pemesanan', 'status_pemesanan', {
      type: Sequelize.STRING, // Assuming it was originally a string.
      allowNull: false,
      defaultValue: 'baru', // You may need to specify the original default value.
    });
  }
};