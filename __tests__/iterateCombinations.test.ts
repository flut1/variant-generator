import { iterateCombinations } from '../src';

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
  })
});
