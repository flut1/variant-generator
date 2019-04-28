import createVariants from '../src';

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
        createVariants(function*() {
          return yield { 0: 'foo', 1: 'bar' };
        }),
      );
    }).toThrowErrorMatchingSnapshot();
  });
});
