'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kamar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Kamar.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Add this line to specify id as the primary key
      autoIncrement: true, // If it's an auto-incrementing primary key
    },
    nomor_kamar: DataTypes.STRING,
    id_tipe_kamar: DataTypes.INTEGER,
    tersedia: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Kamar',
    tableName: 'kamar'
  });
  return Kamar;
};