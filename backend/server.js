const express = require('express');
const BotManager = require('./botManager');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors({
  origin: '*'
}))

const botManager = new BotManager();

app.post('/login', async (req, res) => {
  const { apiKey, apiSecret } = req.body;

  const botId = await botManager.createBot(apiKey, apiSecret);

  return res.send({ botId });
});

app.post('/logout', (req, res) => {
  const { botId } = req.body;

  const terminated = botManager.terminateBot(botId);

  return res.send({ terminated });
})

app.listen(3001);
