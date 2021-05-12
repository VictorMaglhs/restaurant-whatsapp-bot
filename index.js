const { and } = require('sequelize')

module.exports = HandleConnection = async () => {
  const Customer = require('./src/models/Customer')
  const Product = require('./src/models/Product')
  const CustomerProduct = require('./src/models/CustomerProduct')
  const sequelize = require('./src/singletons/sequelize')
  const Sequelize = require('sequelize')
  const { authInfo } = require('./src/connections/AuthInfo')
  const WhatsAppWeb = require('@adiwajshing/baileys')
  const { WAConnection, MessageType, Presence, MessageOptions, Mimetype, WALocationMessage, WA_MESSAGE_STUB_TYPES, ReconnectMode, ProxyAgent, waChatKey } = WhatsAppWeb
  const conn = new WAConnection()

  conn.autoReconnect = ReconnectMode.onConnectionLost
  conn.connectOptions.maxRetries = 10
  conn.charOrderingKey = waChatKey(true)

  await conn.loadAuthInfo(authInfo)
  await conn.connect()
  const { QueryTypes } = Sequelize

  conn.on('message-new', async (m) => {
    if (m.key.fromMe) {
      return false
    }

    const sender = m.key.remoteJid.split('@')[0]
    const messageContent = m.message
    if (!messageContent) return
    const messageType = Object.keys(messageContent)[0]

    if (sender != '553191292142') return false // dps tirar pra ser global

    const readChat = async () => {
      await conn.chatRead(m.key.remoteJid)
      await conn.updatePresence(m.key.remoteJid, Presence.updatePresence)
    }
    try {
      await readChat()
      if (messageType !== MessageType.text) return false
      else {
        var text = m.message.conversation
        var mKey = m.key.remoteJid
      }
    } catch (err) {
      if (err) throw err
    }

    let customer = await Customer.findOne({ where: { phone: sender } })
    let products = await Product.findAll()

    const checkIfCustomerExists = async (phoneNumber) => {
      const customer = await Customer.findOne({ where: { phone: phoneNumber, has_ordered: false } })
      if (!customer) {
        await Customer.create({ phone: phoneNumber })
        await conn.sendMessage(mKey, 'Bem vindo ao restaurante tal, digite *ajuda* para saber nossos comandos!', MessageType.text)
      }

      return customer
    }
    checkIfCustomerExists(sender)

    const getProductsByIds = async (ids) => {
      const products = await Product.findAll({ where: { id: ids } })
      if (!products.length) throw new Error('Product not found')
      return products
    }

    const commands = {
      help: async () => {
        await conn.sendMessage(mKey, `Nossa lista de comandos:\n*[menu]* - enviando a mensagem 'menu' voce recebe nosso cardapio com o codigo dos produtos.\n*[adicionar]* - digite 'adicionar 1,2,3... para adicionar varios produtos ou digite apenas um numero pra um unico produto.\n*[carrinho]* - veja seus pedidos e o valor total de sua conta pra cada um\n*[finalizar]* - (*AINDA NAO IMPLEMENTADO*) envie 'finalizar' para fechar sua conta.`, MessageType.text)
      },
      remove: async (id) => {
        try {
          await getProductsByIds(id)
          const idMap = (Array.isArray(id) ? id : [id]).map((value) => {
            return {
              productId: value,
              customerId: customer.id,
            }
          })
          await CustomerProduct.bulkCreate(idMap, { returning: true })
          const newProducts = await Product.findAll({ where: { id: id } })
          const [{ priceSum }] = await sequelize.query(`SELECT SUM(products.price) AS priceSum FROM customer_products INNER JOIN products ON products.id = customer_products.product_id where customer_id = ${customer.id}`, { type: QueryTypes.SELECT })
          products.reduce((prev, next) => {
            return `${prev}${next.id}.${next.name} [${transformToCurrency(next.price)}]\n`
          }, 'Produtos: \n\n') + `removidos!\n\n*VALOR ATUAL DA CONTA [${transformToCurrency(billSum)}]*`
          await conn.sendMessage(mKey, createDeleteMessage(newProducts, priceSum), MessageType.text)
        } catch (err) {
          console.log(err)
          await conn.sendMessage(mKey, `Id nao existente!`, MessageType.text)
        }
      },
      add: async (id) => {
        try {
          await getProductsByIds(id)
          const idMap = (Array.isArray(id) ? id : [id]).map((value) => {
            return {
              productId: value,
              customerId: customer.id,
            }
          })
          await CustomerProduct.bulkCreate(idMap, { returning: true })
          const newProducts = await Product.findAll({ where: { id: id } })
          const [{ priceSum }] = await sequelize.query(`SELECT SUM(products.price) AS priceSum FROM customer_products INNER JOIN products ON products.id = customer_products.product_id where customer_id = ${customer.id}`, { type: QueryTypes.SELECT })
          const addMessage =
            newProducts.reduce((prev, next) => {
              return `${prev}${next.id} - ${next.name} [${transformToCurrency(next.price)}]\n`
            }, 'Produtos: \n\n') + `adicionados!\n\n*VALOR ATUAL DA CONTA [${transformToCurrency(priceSum)}]*`
          await conn.sendMessage(mKey, addMessage, MessageType.text)
        } catch (err) {
          console.log(err)
          await conn.sendMessage(mKey, `Id nao existente!`, MessageType.text)
        }
      },
      listProducts: async () => {
        products = products.reduce((prev, next) => {
          return `${prev}\n${next.id}. ${next.name} [R$${transformToCurrency(next.price)}]`
        }, 'Aqui esta nosso menu:\n')
        await conn.sendMessage(mKey, `${products}`, MessageType.text)
      },
      listCustomerProducts: async () => {
        console.log(customer.id)
        const [{ priceSum }] = await sequelize.query(`SELECT SUM(products.price) AS priceSum FROM customer_products INNER JOIN products ON products.id = customer_products.product_id where customer_id = ${customer.id}`, { type: QueryTypes.SELECT })
        const customerCart = await sequelize.query(`select customer_products.product_id as id, products.name,products.price, count(customer_products.product_id) as quantity, sum(products.price) as price from customer_products inner join products on products.id = customer_products.product_id where customer_products.customer_id = ${customer.id} group by products.id`, { type: QueryTypes.SELECT })
        const addMessage =
          customerCart.reduce((prev, next) => {
            return `${prev}${next.id} - ${next.name}  - quantidade: ${next.quantity} - preco total: [${transformToCurrency(next.price)}]\n`
          }, 'Carrinho: \n\n') + `\n*VALOR ATUAL DA CONTA [${transformToCurrency(priceSum)}]*`
        await conn.sendMessage(mKey, addMessage, MessageType.text)
      },
      finishCart: () => {},
    }

    const commandsTranslation = {
      remover: commands.remove,
      adicionar: commands.add,
      menu: commands.listProducts,
      carrinho: commands.listCustomerProducts,
      finalizar: commands.finishCart,
      ajuda: commands.help,
    }

    const parseMessage = async (text) => {
      const trimmedMessage = text.trim()
      const [head, ...tail] = trimmedMessage.split(' ')
      let variables = tail.join(' ')
      if (variables.includes(',')) {
        variables = variables.split(',')
      }
      if (!commandsTranslation[head.toLowerCase()]) return
      commandsTranslation[head.toLowerCase()](variables)
    }

    const transformToCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    parseMessage(text)
  })
}

HandleConnection()
