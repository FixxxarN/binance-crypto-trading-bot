const Bot = require('./bot');

class BotManager {
  constructor() {
    this.bots = [];
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