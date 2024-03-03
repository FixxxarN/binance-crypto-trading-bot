const { WebSocket } = require("ws");
const { resolveStrategyFunctions, resolvePeriods, resolveCommand } = require("./utils");

class TradingCrypto {
  constructor(data, currency, strategy) {
    this.currency = currency;
    this.strategy = strategy;
    this.data = data;

    this.websocket = undefined;
    this.strategyFunctions = resolveStrategyFunctions(this.strategy);
    this.buySignals = {};
  };

  async startWebsocketConnection() {
    this.websocket = new WebSocket(`wss://stream.binance.com:443/ws/${this.currency.toLowerCase()}usdt@kline_1m`);

    this.websocket.on('message', async (message) => {
      const incomingMessage = JSON.parse(message.toString());
      const price = Number(incomingMessage['k']['c']);

      const currentData = [...this.data.slice(1), price];

      Object.keys(this.strategyFunctions).forEach((key) => {
        const values = this.strategyFunctions[key]({ values: currentData, period: resolvePeriods(this.strategy.buy[key].periods) });

        const value = values[values.length - 1];

        console.log('price', price);
        console.log('value', value);

        const createSignalFunc = resolveCommand(this.strategy.buy[key].createSignal, value, price);
        const removeSignalFunc = resolveCommand(this.strategy.buy[key].removeSignal, value, price);

        if (createSignalFunc()) {
          this.buySignals[key] = true;
          console.log('Buy signal created for next tick');
        }
        if (removeSignalFunc()) {
          this.buySignals[key] = false;
          console.log('Buy signal removed');
        }
      });

      if (incomingMessage['k']['x']) {
        this.data = [...this.data.slice(1), price];
      }

      if (Object.values(this.buySignals).length === Object.keys(this.strategyFunctions).length && Object.values(this.buySignals).every((signal) => signal)) {
        console.log('I should buy');
      }
    })
  }

  async closeWebsocketConnection() {
    this.websocket.close();
  }
}

module.exports = TradingCrypto;