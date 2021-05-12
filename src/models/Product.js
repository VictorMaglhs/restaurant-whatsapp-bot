const Sequelize = require('sequelize')
const sequelize = require('../singletons/sequelize')
const Customer = require('./Customer')

const { Model } = Sequelize

class Product extends Model {}

Product.init(
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    price: {
      type: Sequelize.FLOAT,
    },
  },
  { sequelize, timestamps: false }
)

module.exports = Product
