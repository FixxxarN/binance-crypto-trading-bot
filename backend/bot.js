const { v4: uuidv4 } = require('uuid');
const ccxt = require('ccxt');
const { resolveAvailableBalance, resolveCurrenciesKeys } = require('./utils');
const TradingCrypto = require('./crypto');

class Bot {
  constructor({ apiKey, apiSecret }) {
    this.id = uuidv4();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    this.exchange = undefined;
    this.clientWebsocketConnection = undefined;

    this.tradingCryptos = [];
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

  async startTrading(currencies, strategy) {
    try {
      currencies.forEach((currency) => {
        const tradingCrypto = new TradingCrypto(currency, strategy);

        tradingCrypto.startWebsocketConnection();

        this.tradingCryptos.push(tradingCrypto);
      });
    } catch (error) {
      console.log('Error: ', error);

      return false;
    }

    return true;
  }

  async stopTrading() {
    try {
      this.tradingCryptos.forEach((tradingCrypto) => {
        tradingCrypto.closeWebsocketConnection();
      })

      this.tradingCryptos = [];
    } catch (error) {
      console.log('Error: ', error);

      return false;
    }

    return true;
  }

  setClientWebsocketConenction(clientWebsocketConnection) {
    this.clientWebsocketConnection = clientWebsocketConnection;
  }
}

module.exports = Bot;