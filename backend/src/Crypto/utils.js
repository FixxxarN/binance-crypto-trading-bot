const rsi = require('technicalindicators').RSI;

const strategyFunctions = {
  rsi: rsi.calculate,
}

const resolveStrategyFunctions = (strategy) => {
  const strategyIndicatorKeys = Object.keys(strategy.buy);

  const strategyFunctionsMap = {};

  strategyIndicatorKeys.forEach(key => {
    if (strategyFunctions[key]) {
      strategyFunctionsMap[key] = strategyFunctions[key]
    }
  })

  return strategyFunctionsMap;
};

const resolvePeriods = (periods) => {
  if (periods.length === 1) {
    return periods[0];
  }
  return periods;
}

const funcMap = {
  '<': (comp1, comp2) => {
    return comp1 < comp2;
  },
  '>': (comp1, comp2) => {
    return comp1 > comp2
  }
}

const resolveComps = (commandItem, value, price) => {
  switch (commandItem) {
    case 'value': {
      return value;
    }
    case 'price': {
      return price
    }
    default: {
      return Number(commandItem);
    }
  }
}

const resolveCommand = (command, value, price) => {
  const commandItems = command.split(' ');
  const func = funcMap[commandItems[1]];
  const comp1 = resolveComps(commandItems[0], value, price);
  const comp2 = resolveComps(commandItems[2], value, price);

  return () => func(comp1, comp2);
}

module.exports = {
  resolveStrategyFunctions,
  resolvePeriods,
  resolveCommand
}