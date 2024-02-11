const { WebSocket } = require("ws");

class TradingCrypto {
  constructor(currency) {
    this.currency = currency;

    this.websocket = undefined;
  };

  async startWebsocketConnection() {
    this.websocket = new WebSocket(`wss://stream.binance.com:443/ws/${this.currency.toLowerCase()}usdt@kline_1m`);

    this.websocket.on('message', async (message) => {
      console.log(JSON.parse(message.toString()));
    })
  }

  async closeWebsocketConnection() {
    this.websocket.close();
  }
}

module.exports = TradingCrypto;