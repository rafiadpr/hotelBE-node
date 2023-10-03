'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Detail_Pemesanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Detail_Pemesanan.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Add this line to specify id as the primary key
      autoIncrement: true, // If it's an auto-incrementing primary key
    },
    id_pemesanan: DataTypes.INTEGER,
    id_kamar: DataTypes.INTEGER,
    tgl_akses: DataTypes.DATE,
    harga: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Detail_Pemesanan',
    tableName: 'detailpemesanan'
  });
  return Detail_Pemesanan;
};