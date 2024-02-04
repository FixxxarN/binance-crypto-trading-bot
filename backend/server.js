const express = require('express');
const BotManager = require('./botManager');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors({
  origin: '*'
}))

const botManager = new BotManager();

app.post('/login', (req, res) => {
  const { apiKey, apiSecret } = req.body;

  const botId = botManager.createBot({ apiKey, apiSecret });

  res.send({ botId });
});

app.listen(3001);
