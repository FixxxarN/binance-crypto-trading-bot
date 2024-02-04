const { v4: uuidv4 } = require('uuid');

class Bot {
  constructor({ apiKey, apiSecret }) {
    this.id = uuidv4();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }
}

module.exports = Bot;