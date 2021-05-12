require('dotenv').config()

const authInfo = {
  clientID: `${process.env.CLIENTID}`,
  serverToken: `${process.env.SERVERTOKEN}`,
  clientToken: `${process.env.CLIENTTOKEN}`,
  encKey: `${process.env.ENCKEY}`,
  macKey: `${process.env.MACKEY}`,
}

module.exports = { authInfo }
