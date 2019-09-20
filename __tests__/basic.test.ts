import createVariants from '../src/index';

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
  test('handles simple 3x2 input', () => {
    const result = createVariants(function*() {
      return [yield [0, 1], yield [2, 3], yield [4, 5]];
    });

    expect(Array.from(result)).toMatchSnapshot();
  });
  test('works with a generator without yields', () => {
    const result = createVariants(function*() {
      return [1, 2, 3];
    });

    expect(Array.from(result)).toMatchSnapshot();
  });
  test('creates different variations for deep-equal inputs', () => {
    const result = createVariants(function*() {
      return [yield [0, 1, 2], yield [0, 1, 2]];
    });

    expect(Array.from(result)).toMatchSnapshot();
  });
  test(`doesn't duplicate variations for strictly equal inputs`, () => {
    const input = [0, 1, 2];
    const result = createVariants(function*() {
      return [yield input, yield input];
    });

    expect(Array.from(result)).toMatchSnapshot();
  });
});
