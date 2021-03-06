import createVariants, { iterateCombinations } from '../index';

describe('createVariants()', () => {
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
  test('throws on a yield with a non-array', () => {
    expect(() => {
      const test = Array.from(
        // cast to any is necessary here because non-arrays are not allowed
        createVariants(function*() {
          return yield { 0: 'foo', 1: 'bar' };
        }),
      );
    }).toThrowErrorMatchingSnapshot();
  });
  test('throws when passing a non-function', () => {
    expect(() => {
      const resultIterator = createVariants([1, 2, 3]);
      resultIterator.next();
    }).toThrowErrorMatchingSnapshot();
  });
  test('throws when passing a non-generator function', () => {
    expect(() => {
      const resultIterator = createVariants(function() {
        return { foo: [0, 1, 2, 3] };
      });
      resultIterator.next();
    }).toThrowErrorMatchingSnapshot();
  });
});
