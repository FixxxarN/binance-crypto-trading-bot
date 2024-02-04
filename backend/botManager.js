const Bot = require('./bot');

class BotManager {
  constructor() {
    this.bots = [];
  }

  createBot({ apiKey, apiSecret }) {
    const newBot = new Bot({ apiKey, apiSecret });

    this.bots.push(newBot);

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