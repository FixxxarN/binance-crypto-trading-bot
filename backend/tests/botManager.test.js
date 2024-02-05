const BotManager = require("../botManager");

describe('BotManager', () => {
  it('should have an empty array of bots when created', () => {
    const botManager = new BotManager();
    expect(botManager.bots).toHaveLength(0);
  });

  describe('createBot', () => {
    it('should add a bot to the array of bots', () => {
      const botManager = new BotManager();
      botManager.createBot('fakeKey', 'fakeSecret');
      expect(botManager.bots).toHaveLength(1);
    });
  });

  describe('findBotById', () => {
    it('should find a bot by id', () => {
      const botManager = new BotManager();
      const createdBotId = botManager.createBot('fakeKey', 'fakeSecret')

      const foundBot = botManager.findBotById(createdBotId);

      expect(foundBot).not.toBeUndefined();
    });

    it('should throw error if no bot found', () => {
      const botManager = new BotManager();
      botManager.createBot('fakeKey', 'fakeSecret')

      const foundBot = botManager.findBotById('fakeId');

      expect(foundBot).toBeUndefined();
    });
  });

  describe('terminateBot', () => {
    it('should return true and remove the bot if it can find it in the array', () => {
      const botManager = new BotManager();
      const botId = botManager.createBot('fakeKey', 'fakeSecret')

      expect(botManager.terminateBot(botId)).toBeTruthy();
    });

    it('should return false if it doesnt find the bot', () => {
      const botManager = new BotManager();

      botManager.createBot('fakeKey', 'fakeSecret')

      expect(botManager.terminateBot('fakeBotId')).toBeFalsy();
    });
  });
});