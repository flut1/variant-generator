import createVariants, { iterateCombinations } from '../index';

describe('compiled js', () => {

  describe('createVariants()', () => {
    test('handles simple 2x2 input', () => {
      const result = createVariants(function*() {
        return {
          bool: yield [false, true],
          num: yield [0, 1],
        };
      });

      expect(Array.from(result)).toMatchSnapshot();
    });
  });

  describe('iterateCombinations', () => {
    test('it runs once for each combination of parameters', () => {
      const spy = jest.fn();

      iterateCombinations(function*() {
        yield [1, 2, 3];

        yield [4, 5, 6];

        yield [7, 8];

        spy();
      });

      expect(spy).toBeCalledTimes(3 * 3 * 2);
    });
  });

  test('handles conditional yields', () => {
    const result = createVariants(function*() {
      const fruit = yield ['banana', 'apple', 'strawberry'];
      let size = 'normal';

      switch (fruit) {
        case 'banana':
          size = yield ['small', 'normal', 'large'];
          break;
        case 'apple':
          size = yield ['small', 'normal'];
          break;
      }
      let color = 'red';

      switch (fruit) {
        case 'banana':
          color = yield ['yellow', 'green'];
          break;
        case 'apple':
          color = yield ['green', 'red'];
          break;
      }

      return {
        fruit,
        size,
        color,
      };
    });

    expect(Array.from(result)).toMatchSnapshot();
  });
});
