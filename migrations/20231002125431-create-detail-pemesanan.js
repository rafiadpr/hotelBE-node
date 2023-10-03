"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DetailPemesanan", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_pemesanan: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_kamar: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tgl_akses: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      harga: {
        type: Sequelize.FLOAT,
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
    await queryInterface.dropTable("DetailPemesanan");
  },
};
