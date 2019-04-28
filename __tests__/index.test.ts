import createVariants, { iterateCombinations } from '../src/index';

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
    test('throws on yields with different lengths', () => {
        expect(() => {
            const inputs = [[1, 2, 3], [1, 2, 3, 4]];
            let pickInputAtIndex = 0;

            function getInput() {
                pickInputAtIndex = pickInputAtIndex ? 0 : 1;
                return inputs[pickInputAtIndex];
            }

            const resultIterator = createVariants(function*() {
                return [yield getInput()];
            });

            // iterate limited number of times to prevent infinite loop
            resultIterator.next();
            resultIterator.next();
            resultIterator.next();
            resultIterator.next();
            resultIterator.next();
        }).toThrowErrorMatchingSnapshot();
    });
    test('throws on yields with different types', () => {
        expect(() => {
            const inputs = [[1, 2, 3], [1, 2, 'foo']];
            let pickInputAtIndex = 0;

            function getInput() {
                pickInputAtIndex = pickInputAtIndex ? 0 : 1;
                return inputs[pickInputAtIndex];
            }

            const resultIterator = createVariants(function*() {
                return [yield getInput()];
            });

            // iterate limited number of times to prevent infinite loop
            resultIterator.next();
            resultIterator.next();
            resultIterator.next();
            resultIterator.next();
            resultIterator.next();
        }).toThrowErrorMatchingSnapshot();
    });
    test(`doesn't duplicate variations for strictly equal inputs`, () => {
        const input = [0, 1, 2];
        const result = createVariants(function*() {
            return [yield input, yield input];
        });

        expect(Array.from(result)).toMatchSnapshot();
    });
    test('throws on a yield with a non-array', () => {
        expect(() => {
            const test = Array.from(
                createVariants(function*() {
                    return yield { 0: 'foo', 1: 'bar' };
                }),
            );
        }).toThrowErrorMatchingSnapshot();
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
            let color: string = 'red';

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
