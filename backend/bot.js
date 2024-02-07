const { v4: uuidv4 } = require('uuid');
const ccxt = require('ccxt');
const { resolveAvailableBalances, resolveCurrenciesKeys } = require('./utils');

class Bot {
  constructor({ apiKey, apiSecret }) {
    this.id = uuidv4();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async connectToBinance() {
    this.exchange = await new ccxt.binance({
      apiKey: this.apiKey,
      secret: this.apiSecret
    });
  }

  async fetchBalance() {
    return await this.exchange.fetchTotalBalance().then(balance => resolveAvailableBalance(balance));
  }

  async fetchCurrencies() {
    return await this.exchange.fetchCurrencies().then((currencies) => resolveCurrenciesKeys(currencies));
  }

  async checkIfCredentialsAreValid() {
    return await this.exchange.fetchFreeBalance().then((b) => b);
  }
}

module.exports = Bot;