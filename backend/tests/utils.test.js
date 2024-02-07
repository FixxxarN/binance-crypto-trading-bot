const { resolveAvailableBalance, resolveCurrenciesKeys } = require("../utils");

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
});