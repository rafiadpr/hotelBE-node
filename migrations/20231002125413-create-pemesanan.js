"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Pemesanan", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nomor_pemesanan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nama_pemesan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email_pemesan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tgl_pemesanan: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      tgl_check_in: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      tgl_check_out: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      nama_tamu: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jumlah_kamar: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_kamar: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status_pemesanan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("Pemesanan");
  },
};
