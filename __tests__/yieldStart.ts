import createVariants from '../src/index';

describe('createVariants()', () => {
  test('it handles yields in helper functions with yield star', () => {

    function* getFirstProp() {
      return {
        foo: yield [1, 2],
        foobar: yield ['A', 'B'],
      }
    }

    function* getSecondProp() {
      return {
        foo: yield [3, 4],
        foobar: yield ['C', 'D'],
      }
    }

    const result = createVariants(function* getConfig() {
      return {
        firstProp: yield* getFirstProp(),
        secondProp: yield* getSecondProp(),
      };
    });

    expect(Array.from(result)).toMatchSnapshot();
  });
});
