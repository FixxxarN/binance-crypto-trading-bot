const resolveAvailableBalance = (balances) => {
  const balanceMap = {};
  Object.entries(balances).forEach(([key, value]) => {
    if (value > 0) {
      balanceMap[key] = value;
    }
  });
  return balanceMap;
}

const resolveCurrenciesKeys = (currencies) => {
  return Object.keys(currencies).sort();
}

module.exports = {
  resolveAvailableBalance,
  resolveCurrenciesKeys,
}