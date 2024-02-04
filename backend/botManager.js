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

  findBotById(botId) {
    return this.bots.find((bot) => bot.id === botId);
  }
}

module.exports = BotManager;