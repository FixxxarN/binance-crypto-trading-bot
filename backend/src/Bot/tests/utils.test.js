const { resolveAvailableBalance, resolveCurrenciesKeys, resolveClosingPriceFromOHLCV } = require("../utils");

describe('utils', () => {
  describe('resolveAvailableBalance', () => {
    it('should return balance that are greater than 0', () => {
      const result = resolveAvailableBalance({
        BNB: 0.02,
        BTC: 0,
        ETH: 0,
        SOL: 13,
        USDT: 34
      });

      expect(result).toEqual({
        BNB: 0.02,
        SOL: 13,
        USDT: 34,
      })
    });
  });

  describe('resolveCurrenciesKeys', () => {
    it('should map out all the keys', () => {
      const result = resolveCurrenciesKeys({
        SOL: {
          id: 'SOL',
          name: 'Solana'
        },
        ETH: {
          id: 'ETH',
          name: 'Ethereum'
        }
      });

      expect(result).toEqual([
        'ETH',
        'SOL'
      ]);
    });
  });

  describe('resolveClosingPriceFromOHLCV', () => {
    it('should return only closing prices from OHLCV', () => {
      const data = [
        [1707988560000, 115.61, 115.86, 115.61, 115.82, 2236.01],
        [1707988620000, 115.83, 115.93, 115.79, 115.93, 3815.89],
        [1707988680000, 115.92, 116.02, 115.88, 115.89, 6636.75],
        [1707988740000, 115.88, 115.91, 115.81, 115.86, 1844.48],
        [1707988800000, 115.85, 115.88, 115.8, 115.84, 1347.87],
      ]

      const result = resolveClosingPriceFromOHLCV(data);

      expect(result).toEqual([115.82, 115.93, 115.89, 115.86, 115.84]);
    });
  });
});