'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pemesanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Pemesanan.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Add this line to specify id as the primary key
      autoIncrement: true, // If it's an auto-incrementing primary key
    },
    nomor_pemesanan: DataTypes.STRING,
    nama_pemesan: DataTypes.STRING,
    email_pemesan: DataTypes.STRING,
    tgl_pemesanan: DataTypes.DATE,
    tgl_check_in: DataTypes.DATE,
    tgl_check_out: DataTypes.DATE,
    nama_tamu: DataTypes.STRING,
    jumlah_kamar: DataTypes.INTEGER,
    id_kamar: DataTypes.INTEGER,
    status_pemesanan: DataTypes.STRING,
    id_user: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Pemesanan',
    tableName: 'pemesanan'
  });
  return Pemesanan;
};