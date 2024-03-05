const { v4: uuidv4 } = require('uuid');
const ccxt = require('ccxt');
const { resolveAvailableBalance, resolveCurrenciesKeys, resolveClosingPriceFromOHLCV } = require('./utils');
const { WebSocket } = require("ws");
const { resolveStrategyFunctions, resolvePeriods, resolveCommand } = require('../Crypto/utils');

class Bot {
  constructor({ apiKey, apiSecret }) {
    this.id = uuidv4();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    this.exchange = undefined;
    this.clientWebsocketConnection = undefined;

    this.tradingCryptos = [];
    this.strategyFunctions = undefined;
    this.strategy = undefined;
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

  async fetchCurrencyData(currency, timeframe) {
    return await this.exchange.fetchOHLCV(`${currency}/USDT`, timeframe).then((ohlcv) => resolveClosingPriceFromOHLCV(ohlcv));
  }

  async createMarketBuyOrder(currency, price) {
    const balance = await this.fetchBalance();

    if (balance[currency]) {
      return;
    }

    const usdtBalance = await balance['USDT'];

    if (usdtBalance > 0) {
      const amount = usdtBalance * (this.strategy.buyPricePercentLimit / 100) / price;
      const flooredAmount = Math.floor(amount);

      await this.exchange.createMarketBuyOrder(`${currency}/USDT`, flooredAmount)

      console.log(`Bought ${currency} for ${price}`);
      const tradingCrypto = await this.tradingCryptos.find((tradingCrypto) => tradingCrypto.currency === currency);
      tradingCrypto.takeProfit = price * ((this.strategy.takeProfitPercentLimit / 100) + 1);
      tradingCrypto.stopLoss = price * (1 - (this.strategy.stopLossPercentLimit / 100));
    }
  }

  async createMarketSellOrder(currency) {
    const balance = await this.fetchBalance();

    if (!balance[currency]) {
      return;
    }

    await this.exchange.createMarketSellOrder(`${currency}/USDT`, balance[currency]);
    console.log(`Sold ${currency}`);
  }

  async checkIfCredentialsAreValid() {
    return await this.exchange.fetchFreeBalance().then((b) => b);
  }

  async handleIncomingMessage(incomingMessage) {
    const currency = incomingMessage['s'].replace('USDT', '');
    const tradingCrypto = this.tradingCryptos.find((tradingCrypto) => tradingCrypto.currency === currency);

    const price = Number(incomingMessage['k']['c']);

    const currentData = [...tradingCrypto.data.slice(1), price];

    Object.keys(this.strategyFunctions).forEach((key) => {
      const values = this.strategyFunctions[key]({ values: currentData, period: resolvePeriods(this.strategy.buy[key].periods) });

      const value = values[values.length - 1];

      const createSignalFunc = resolveCommand(this.strategy.buy[key].createSignal, value, price);
      const removeSignalFunc = resolveCommand(this.strategy.buy[key].removeSignal, value, price);

      if (createSignalFunc()) {
        tradingCrypto.buySignals[key] = true;
        console.log('Buy signal created for next tick');
      }
      if (removeSignalFunc()) {
        tradingCrypto.buySignals[key] = false;
        console.log('Buy signal removed');
      }
    });

    if (incomingMessage['k']['x']) {
      tradingCrypto.data = [...tradingCrypto.data.slice(1), price];
    }

    if (Object.values(tradingCrypto.buySignals).length === Object.keys(this.strategyFunctions).length && Object.values(tradingCrypto.buySignals).every((signal) => signal)) {
      this.createMarketBuyOrder(currency, price);
    }

    if (tradingCrypto.takeProfit && price >= tradingCrypto.takeProfit) {
      this.createMarketSellOrder(currency)
      delete tradingCrypto.takeProfit;
    }

    if (tradingCrypto.stopLoss && price <= tradingCrypto.stopLoss) {
      this.createMarketSellOrder(currency)
      delete tradingCrypto.stopLoss;
    }
  }

  async startTrading(currencies, strategy) {
    try {
      this.strategyFunctions = await resolveStrategyFunctions(strategy);
      this.strategy = strategy;

      await currencies.forEach(async (currency) => {
        const data = await this.fetchCurrencyData(currency, strategy.timeframe);

        const websocket = new WebSocket(`wss://stream.binance.com:443/ws/${currency.toLowerCase()}usdt@kline_${strategy.timeframe}`);

        websocket.on('message', async (message) => {
          const incomingMessage = JSON.parse(message.toString());
          this.handleIncomingMessage(incomingMessage);
        });

        const tradingCrypto = {
          currency,
          data,
          websocket,
          buySignals: {}
        }

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
        tradingCrypto.websocket.close();
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