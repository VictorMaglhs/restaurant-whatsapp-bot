const Sequelize = require('sequelize')
const sequelize = require('../singletons/sequelize')
const Customer = require('./Customer')
const Product = require('./Product')
const { Model } = Sequelize

class CustomerProduct extends Model {}

CustomerProduct.init(
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },
    productId: {
      type: Sequelize.STRING,
      field: 'product_id',
    },
    customerId: {
      type: Sequelize.STRING,
      field: 'customer_id',
    },
  },
  { sequelize, timestamps: false, tableName: 'customer_products' }
)

// CustomerProduct.hasOne(Product, { as: 'product' })
// CustomerProduct.hasOne(Customer, { as: 'customer' })

module.exports = CustomerProduct
