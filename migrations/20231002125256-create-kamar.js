"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Kamar", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nomor_kamar: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      id_tipe_kamar: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tersedia: {
        type: Sequelize.ENUM("Tersedia", "Tidak Tersedia"), // Define the allowed values as ENUM
        allowNull: false,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Kamar");
  },
};
