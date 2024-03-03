const express = require('express');
const BotManager = require('./BotManager/botManager');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors({
  origin: '*'
}))

const botManager = new BotManager();

const checkIfBotExists = async (botId) => {
  const bot = await botManager.findBotById(botId);

  if (!bot) return res.sendStatus(401);

  return bot;
}

app.post('/login', async (req, res) => {
  const { apiKey, apiSecret } = req.body;

  const botId = await botManager.createBot(apiKey, apiSecret);

  return res.send({ botId });
});

app.get('/balance', async (req, res) => {
  const { botId } = req.body;

  const bot = await checkIfBotExists(botId);

  const balance = await bot.fetchBalance();

  return res.send({ balance });
})

app.get('/currencies', async (req, res) => {
  const { botId } = req.body;

  const bot = await checkIfBotExists(botId);

  const currencies = await bot.fetchCurrencies();

  return res.send({ currencies });
})

app.delete('/logout', (req, res) => {
  const { botId } = req.body;

  const terminated = botManager.terminateBot(botId);

  return res.send({ terminated });
})

app.post('/start', async (req, res) => {
  const { botId, currencies, strategy } = req.body;

  const bot = await checkIfBotExists(botId);

  const started = await bot.startTrading(currencies, strategy);

  return res.send({ started });
});

app.post('/stop', async (req, res) => {
  const { botId } = req.body;

  const bot = await checkIfBotExists(botId);

  const stopped = await bot.stopTrading();

  return res.send({ stopped });
});

app.listen(3001);
