const Sequelize = require('sequelize')
require('dotenv').config()

module.exports = new Sequelize(process.env.SEQUELIZE_CONNECTION_STRING)
