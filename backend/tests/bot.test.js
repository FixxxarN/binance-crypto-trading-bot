const Bot = require("../bot");

describe('Bot', () => {
  it('should have an id, apiKey, apiSecret when created', () => {
    const apiKey = 'fakeKey';
    const apiSecret = 'fakeSecret';

    const bot = new Bot({ apiKey, apiSecret });

    expect(bot.id).not.toBeUndefined();
    expect(bot).toHaveProperty('apiKey', apiKey);
    expect(bot).toHaveProperty('apiSecret', apiSecret);
  });
});