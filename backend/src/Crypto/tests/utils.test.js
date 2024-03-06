const { resolveStrategyFunctions, resolvePeriods, resolveCommand } = require("../utils");

describe('crypto utils', () => {
  describe('resolveStrategyFunctions', () => {
    it('should return the strategyFunctions for each strategy indicator', () => {
      const strategy = {
        buy: {
          rsi: {
            periods: [14],
            createSignal: 'value < 30',
            removeSignal: 'value > 40'
          },
          ema: {
            periods: [200],
            createSignal: 'price > value',
            removeSignal: 'price < value'
          },
          sma: {
            periods: [200],
            createSignal: 'price > value',
            removeSignal: 'price < value'
          }
        }
      }

      const result = resolveStrategyFunctions(strategy);

      expect(result).toEqual({
        rsi: expect.any(Function),
        ema: expect.any(Function),
        sma: expect.any(Function)
      })
    });
  });

  describe('resolvePeriods', () => {
    it('should return the first item if length only one', () => {
      const result = resolvePeriods([14]);
      expect(result).toEqual(14);
    });

    it('should return all items if length is not one', () => {
      const result = resolvePeriods([9, 14, 26]);
      expect(result).toEqual([9, 14, 26]);
    });
  });

  describe('resolveCommand', () => {
    it('should go through string and figure out what to do', async () => {
      const result = await resolveCommand('value < 30', 29, 129);
      const signalCreatedFromCommand = await result();

      expect(signalCreatedFromCommand).toBeTruthy();
    });
  });
});