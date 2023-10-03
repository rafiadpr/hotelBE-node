'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tipe_Kamar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Tipe_Kamar.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Add this line to specify id as the primary key
      autoIncrement: true, // If it's an auto-incrementing primary key
    },
    nama_tipe_kamar: DataTypes.STRING,
    harga: DataTypes.TEXT,
    deskripsi: DataTypes.TEXT,
    foto: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tipe_Kamar',
    tableName: 'tipekamar'
  });
  return Tipe_Kamar;
};