const rsi = require('technicalindicators').RSI;
const ema = require('technicalindicators').EMA;
const sma = require('technicalindicators').SMA;
const macd = require('technicalindicators').MACD;

const strategyFunctions = {
  rsi: ({ values, period }) => rsi.calculate({ values, period }),
  ema: ({ values, period }) => ema.calculate({ values, period }),
  sma: ({ values, period }) => sma.calculate({ values, period }),
  macd: ({ values, period }) => macd.calculate({ values, fastPeriod: period[0], slowPeriod: period[1], signalPeriod: period[2] })
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
  },
  'x^': (comp1, comp2, comp3, comp4) => {
    return comp1 < comp2 && comp3 > comp4;
  },
  'xv': (comp1, comp2, comp3, comp4) => {
    return comp1 > comp2 && comp3 < comp4;
  }
}

const resolveComps = (commandItem, value, price) => {
  switch (commandItem) {
    case 'value': {
      return value;
    }
    case 'price': {
      return price;
    }
    case 'macd': {
      return value?.MACD;
    }
    case 'signal': {
      return value?.signal;
    }
    default: {
      return Number(commandItem);
    }
  }
}

const resolveCommand = (command, price, value, prevValue) => {
  const commandItems = command.split(' ');

  const func = funcMap[commandItems[1]];

  const comp1 = resolveComps(commandItems[0], value, price);
  const comp2 = resolveComps(commandItems[2], value, price);
  const comp3 = resolveComps(commandItems[0], prevValue, price);
  const comp4 = resolveComps(commandItems[2], prevValue, price);

  return () => func(comp1, comp2, comp3, comp4);
}

module.exports = {
  resolveStrategyFunctions,
  resolvePeriods,
  resolveCommand
}