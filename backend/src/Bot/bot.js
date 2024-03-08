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

    this.tradingCryptos = {};
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

      const tradingCrypto = this.tradingCryptos[currency];

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
  }

  async checkIfCredentialsAreValid() {
    return await this.exchange.fetchFreeBalance().then((b) => b);
  }

  async handleIncomingMessage(incomingMessage) {
    const currency = incomingMessage['s'].replace('USDT', '');
    const tradingCrypto = this.tradingCryptos[currency];

    const price = Number(incomingMessage['k']['c']);

    const currentData = [...tradingCrypto.data.slice(1), price];

    Object.keys(this.strategyFunctions).forEach((key) => {
      const values = this.strategyFunctions[key]({ values: currentData, period: resolvePeriods(this.strategy.buy[key].periods) });

      const value = values[values.length - 1];
      const prevValue = values[values.length - 2];

      const createSignalFunc = resolveCommand(this.strategy.buy[key].createSignal, price, value, prevValue);
      const removeSignalFunc = resolveCommand(this.strategy.buy[key].removeSignal, price, value, prevValue);

      if (createSignalFunc()) {
        tradingCrypto.buySignals[key] = true;
      }
      if (removeSignalFunc()) {
        tradingCrypto.buySignals[key] = false;
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

        this.tradingCryptos[currency] = tradingCrypto;
      });
    } catch (error) {
      console.log('Error: ', error);

      return false;
    }

    return true;
  }

  async stopTrading() {
    try {
      Object.keys(this.tradingCryptos).forEach((key) => {
        this.tradingCryptos[key].websocket.close();
      })

      this.tradingCryptos = {};
    } catch (error) {
      console.log('Error: ', error);

      return false;
    }

    return true;
  }

  setClientWebsocketConenction(clientWebsocketConnection) {
    this.clientWebsocketConnection = clientWebsocketConnection;
  }

  async backtest(startingBalance = 1000, currencies, strategy) {
    const strategyFunctions = resolveStrategyFunctions(strategy);

    const result = {};

    const backtestingDone = new Promise((resolve, reject) => {
      currencies.forEach(async (currency) => {
        result[currency] = {};

        await this.fetchCurrencyData(currency, strategy.timeframe).then((data) => {
          let currentBalance = startingBalance;

          const graphData = [];
          const buySignals = {};

          let takeProfit = undefined;
          let stopLoss = undefined;
          let holdingCrypto = false;
          let holdingAmount = undefined;

          for (let i = 0; i < data.length; i++) {
            const fetchedData = [...data];
            const currentData = [...fetchedData.splice(0, i + 1)];
            const price = currentData[currentData.length - 1];

            Object.keys(strategyFunctions).forEach((key) => {
              const values = strategyFunctions[key]({ values: currentData, period: resolvePeriods(strategy.buy[key].periods) });

              const value = values[values.length - 1];
              const prevValue = values[values.length - 2];

              const createSignalFunc = resolveCommand(strategy.buy[key].createSignal, price, value, prevValue);
              const removeSignalFunc = resolveCommand(strategy.buy[key].removeSignal, price, value, prevValue);

              if (createSignalFunc()) {
                buySignals[key] = true;
              }
              if (removeSignalFunc()) {
                buySignals[key] = false;
              }
            });

            if (!holdingCrypto && Object.values(buySignals).length === Object.keys(strategyFunctions).length && Object.values(buySignals).every((signal) => signal)) {
              const amount = currentBalance * (strategy.buyPricePercentLimit / 100) / price;
              const flooredAmount = Math.floor(amount);

              currentBalance -= flooredAmount * price;
              holdingCrypto = true;
              holdingAmount = flooredAmount;

              takeProfit = price * ((strategy.takeProfitPercentLimit / 100) + 1);
              stopLoss = price * (1 - (strategy.stopLossPercentLimit / 100));
              graphData.push({ value: price, bought: true, cost: flooredAmount * price });
              continue;
            }

            if (holdingCrypto && takeProfit && price >= takeProfit) {
              currentBalance += holdingAmount * price;

              takeProfit = undefined;
              stopLoss = undefined;
              holdingCrypto = false;
              graphData.push({ value: price, sold: true, cost: holdingAmount * price });
              holdingAmount = undefined;
              continue;
            }

            if (holdingCrypto && stopLoss && price <= stopLoss) {
              currentBalance += holdingAmount * price;

              stopLoss = undefined;
              takeProfit = undefined;
              holdingCrypto = false;
              graphData.push({ value: price, sold: true, cost: holdingAmount * price });
              holdingAmount = undefined;
              continue;
            }

            graphData.push({ value: price });
          }

          if (graphData.filter((data) => data.bought).length > graphData.filter((data) => data.sold).length) {
            graphData.reverse();
            const lastBuyIndex = graphData.findIndex((data) => data.bought);
            graphData[lastBuyIndex] = { value: graphData[lastBuyIndex].value };
            graphData.reverse();
          }

          const newCurrentBalance = graphData.filter((data) => data.bought || data.sold).reduce((prev, curr) => {
            if (curr.bought) return prev - curr.cost;
            if (curr.sold) return prev + curr.cost;
          }, startingBalance);

          result[currency].startingBalance = startingBalance;
          result[currency].currentBalance = newCurrentBalance;
          result[currency].profitLoss = Math.round(((newCurrentBalance / startingBalance * 100 - 100) + Number.EPSILON) * 100) / 100;
          result[currency].graphData = graphData;
        });

        resolve();
      })
    });

    return backtestingDone.then(() => result);
  }
}

module.exports = Bot;