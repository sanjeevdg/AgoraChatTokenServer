//import mongoose from 'mongoose'
const {Sequelize} = require('sequelize');

const sequelize = require('../utils/database.js');

/*
const UserSchema = new mongoose.Schema({
  account: String,
  password: String,
  chatUsername: String,
  userUuid: String
})
*/
const User = sequelize.define('users',{
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
      account: {
      type: Sequelize.STRING,
      allowNull: true,
   },
	password: {
      type: Sequelize.STRING,
      allowNull: true,
   },
	chatUsername: {
      type: Sequelize.STRING,
      allowNull: true,
   },
	userUuid: {
      type: Sequelize.STRING,
      allowNull: true,
   },
});

//const User = mongoose.model('User', UserSchema)
module.exports = User



