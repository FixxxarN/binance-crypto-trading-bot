const BotManager = require("./botManager");
const Bot = require('../Bot/bot');

describe('BotManager', () => {
  beforeEach(() => {
    jest.spyOn(BotManager.prototype, 'initializeWebsocketServer').mockImplementation(() => true);

    jest.spyOn(Bot.prototype, 'connectToBinance').mockImplementation(() => true);
  });

  it('should have an empty array of bots when created', () => {
    const botManager = new BotManager();
    expect(botManager.bots).toHaveLength(0);
  });

  describe('createBot', () => {
    it('should add a bot to the array of bots', async () => {
      jest.spyOn(Bot.prototype, 'checkIfCredentialsAreValid').mockImplementation(() => true);

      const botManager = new BotManager();

      await botManager.createBot('fakeKey', 'fakeSecret');

      expect(botManager.bots).toHaveLength(1);
    });
  });

  describe('findBotById', () => {
    it('should find a bot by id', async () => {
      jest.spyOn(Bot.prototype, 'checkIfCredentialsAreValid').mockImplementation(() => true);

      const botManager = new BotManager();

      const createdBotId = await botManager.createBot('fakeKey', 'fakeSecret')
      const foundBot = await botManager.findBotById(createdBotId);

      expect(foundBot).not.toBeUndefined();
    });

    it('should throw error if no bot found', async () => {
      jest.spyOn(Bot.prototype, 'checkIfCredentialsAreValid').mockImplementation(() => { throw new Error(); });

      const botManager = new BotManager();

      await botManager.createBot('fakeKey', 'fakeSecret')
      const foundBot = await botManager.findBotById('fakeId');

      expect(foundBot).toBeUndefined();
    });
  });

  describe('terminateBot', () => {
    it('should return true and remove the bot if it can find it in the array', async () => {
      jest.spyOn(Bot.prototype, 'checkIfCredentialsAreValid').mockImplementation(() => true);

      const botManager = new BotManager();
      const botId = await botManager.createBot('fakeKey', 'fakeSecret')

      expect(botManager.terminateBot(botId)).toBeTruthy();
    });

    it('should return false if it doesnt find the bot', () => {
      jest.spyOn(Bot.prototype, 'checkIfCredentialsAreValid').mockImplementation(() => { throw new Error(); });


      const botManager = new BotManager();

      botManager.createBot('fakeKey', 'fakeSecret')

      expect(botManager.terminateBot('fakeBotId')).toBeFalsy();
    });
  });
});