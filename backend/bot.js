const { v4: uuidv4 } = require('uuid');
const ccxt = require('ccxt');

class Bot {
  constructor({ apiKey, apiSecret }) {
    this.id = uuidv4();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    this.initializeExchange(apiKey, apiSecret);
  }

  async initializeExchange(apiKey, apiSecret) {
    this.exchange = await new ccxt.binance({
      apiKey: apiKey,
      secret: apiSecret
    })
  }
}

module.exports = Bot;