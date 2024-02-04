
This repository will consist of a frontend and a backend that will communicate with each other. The frontend will be written in React using Material UI as UI library and the backend will be written in Node. 

As an MVP this binance crypto trading bot will run locally which means that the user will need to have node installed and some other packages. 

The reason for this bot is to try to make more money than it loses with custom strategies and back-testing functionality.

Requirements

User requirements
- [ ] As a user i want to be able to login to the application and be assigned a bot.
- [ ] As a user i want to be able to logout from the application and terminate the bot.
- [ ] As a user i want to be able to see my balance(s) in binance.
- [ ] As a user i want to be able to start and stop my assigned bot.
- [ ] As a user i want to be able to add strategies.
- [ ] As a user i want to assign the bot a selected strategy.
- [ ] As a user i want to be able to see all my current positions that the bot is holding.
- [ ] As a user i want to be able to see the PnL values for the holding positions live. 
- [ ] As a user i want to be able to panic sell if i feel like im satisfied with the current win or scared of the current loss.
- [ ] As a user i want to see my balances update every time the bot buys or sells a crypto.
- [ ] As a user i want to be able to select which cryptos the bot will buy and sell.
- [ ] As a user i want to be able to back-test my strategies on a specific crypto and a specific time interval. 

<br>

- [ ] The login button should be disabled until both fields atleast have one character
- [ ] Clicking on the start bot button and not having selected any cryptos or strategies should show the user some kind of error message
- [ ] Limit the selected amount of cryptos to maybe 1-2 in the beginning
- [ ] The strategies should be saved in the browser via localStorage
      
