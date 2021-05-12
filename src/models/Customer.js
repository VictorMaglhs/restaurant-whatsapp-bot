const Sequelize = require('sequelize')
const sequelize = require('../singletons/sequelize')

const { Model } = Sequelize

class Customer extends Model {}

Customer.init(
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },
    phone: {
      type: Sequelize.STRING,
    },
    has_ordered: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  },
  { sequelize, timestamps: false }
)

module.exports = Customer
