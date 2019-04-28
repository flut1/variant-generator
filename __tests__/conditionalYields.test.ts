import createVariants from '../src/index';

describe('createVariants()', () => {
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
