"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TipeKamar", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nama_tipe_kamar: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      harga: {
        type: Sequelize.DECIMAL(10, 2), // 10 total digits, 2 digits after the decimal point
        allowNull: false,
      },
      deskripsi: Sequelize.STRING,
      foto: Sequelize.STRING,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("TipeKamar");
  },
};
