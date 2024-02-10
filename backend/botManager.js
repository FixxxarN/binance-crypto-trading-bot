const { WebSocket } = require('ws');
const Bot = require('./bot');

class BotManager {
  constructor() {
    this.bots = [];

    this.initializeWebsocketServer();
  }

  async initializeWebsocketServer() {
    this.websocketServer = await new WebSocket.WebSocketServer({ port: 3002 });

    this.websocketServer.on('connection', async (ws, request) => {
      const botId = request.url.split('botId=')[1];

      const bot = await this.findBotById(botId);

      bot.setClientWebsocketConenction(ws);
    })
  }

  async createBot(apiKey, apiSecret) {
    const newBot = await new Bot({ apiKey, apiSecret });

    await newBot.connectToBinance();

    try {
      await newBot.checkIfCredentialsAreValid();
    } catch (error) {
      return null;
    }

    await this.bots.push(newBot);

    return newBot.id;
  }

  terminateBot(botId) {
    const index = this.bots.findIndex((bot) => bot.id === botId);

    if (index === -1) return false;

    this.bots.splice(index, 1);

    return true;
  }

  findBotById(botId) {
    return this.bots.find((bot) => bot.id === botId);
  }
}

module.exports = BotManager;