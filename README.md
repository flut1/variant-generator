# Variant Generator
Small utility that generates multiple variation for each combination of input parameters

## Installation
`npm install --save variant-generator` or `yarn add variant-generator`

## Explanation
This utility considers a different approach to generating all possibilities of a given input value.

Consider the following example:
```js
const sentences = [];
for (const emotion of ['happy', 'moody', 'scared']) {
  for (const animal of ['cat', 'dog']) {
    for (const location of ['bar', 'house']) {
      sentences.push(`a ${emotion} ${animal} walked into a ${location}`);
    }
  }
}
console.log(sentences.join(', '));
// a happy cat walked into a bar, a happy cat walked into a house, a happy dog walked into a bar, a happy dog walked into a house, a moody cat walked into a bar, a moody cat walked into a house, a moody dog walked into a bar, a moody dog walked into a house, a scared cat walked into a bar, a scared cat walked into a house, a scared dog walked into a bar, a scared dog walked into a house
```

variant-generator allows you to generate these kinds of combinations, but instead of wrapping a loop **outside of the value**, the inputs are **yielded inline**. This is done using es6 generators. The following example logs the same sentences: 

```js
const createVariants = require('variant-generator');

const sentenceGenerator = createVariants(function* () {
  return `a ${
    yield ['happy', 'moody', 'scared']
  } ${
    yield ['cat', 'dog']
  } walked into a ${
    yield ['bar', 'house']
  }`;
});
console.log(sentenceGenerator.next().value);
// a happy cat walked into a bar
console.log(sentenceGenerator.next().value);
// a happy cat walked into a house
console.log(sentenceGenerator.next().value);
// a happy dog walked into a bar

// etc...
```

## Motivation
Admittedly using this utility may make your code more difficult to understand. This is especially the case with a trivial example like in the explanation above. The main reason I published this utility anyway is I just thought it was an interesting thought exercise. However, there are a couple of hypothetical situations where this utility may be useful:

### Composability
When having multiple variant generator functions, such as the ones below:
```js
function* generatePeople() {
  return {
    firstName: yield ['Jack', 'Dwayne'],
    lastName: yield ['Johnson', 'Black'],
  };
}

function* generateJob() {
  return {
    role: yield ['plumber', 'teacher', 'programmer'],
    location: yield ['Sydney', 'London'],
  };
}
```
You can generate all combinations between them using the `yield*` operator:
```js
const combinedGenerator = createVariants(function*() {
  return {
    ...(yield* generatePeople()),
    ...(yield* generateJob()),
  };
});
console.log(JSON.stringify(Array.from(combinedGenerator), null, ' '));
// [
//  {
//   "firstName": "Jack",
//   "lastName": "Johnson",
//   "role": "plumber",
//   "location": "Sydney"
//  },
//  {
//   "firstName": "Jack",
//   "lastName": "Johnson",
//   "role": "plumber",
//   "location": "London"
//  },
// ...
//  {
//   "firstName": "Dwayne",
//   "lastName": "Black",
//   "role": "programmer",
//   "location": "London"
//  }
// ]
```

### Large configuration
For large objects, it can be useful to write the possible input values inline rather than using a loop. Consider the following example:
```js
// webpack.config.js
function getWebpackConfigs() {
  return ['last 2 chrome versions', '> .5% and not last 2 versions'].map(browsersList => ({
    entry: getWebpackEntryConfig(),
    output: getWebpackOutputConfig(),
    module: getWebpackModuleConfig(browsersList),
    // ...
  }));
}


// webpack.config.module.js
function getWebpackModuleConfig(browsersList) {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          oneOf: [
            {
              resourceQuery: /inline/, // foo.css?inline
              use: 'url-loader'
            },
            {
              resourceQuery: /external/, // foo.css?external
              use: 'file-loader'
            }
          ]
        },
        {
          test: /\.js$/,
          use:  {
            loader: 'babel-loader',
            options: getBabelLoaderOptions(browsersList),
          }
        },
        // ...
      ]
    }
  }
}

function getBabelLoaderOptions(browsersList) {
  return {
    presets: ['@babel/preset-env', { targets: browsersList }],
    plugins: ['@babel/plugin-proposal-object-rest-spread']
  }
}
```
Note how: 

* We have to pass a variable down to all levels of helper functions. This may become messy with many variables.
* In `getBabelLoaderOptions()`, we can't directly see the possible values of `browsersList`. We have to navigate to a different file to find the actual values.

In contrast, the following may be somewhat easier to navigate:

```js
// webpack.config.js
function getWebpackConfigs() {
  return Array.from(createVariants(function* () {
    return {
      entry: yield* getWebpackEntryConfig(),
      output: yield* getWebpackOutputConfig(),
      module: yield* getWebpackModuleConfig(),
    };
  }));
}

// webpack.config.module.js
// ...
function* getBabelLoaderOptions() {
  return {
    presets: [
      '@babel/preset-env',
      { targets: yield ['last 2 chrome versions', '> .5% and not last 2 versions'] },
    ],
    plugins: ['@babel/plugin-proposal-object-rest-spread'],
  };
}
```

> **note:** this above is just a hypothetical example. I do not necessarily advocate to organize your webpack configuration in this way.  

## Typescript usage
This module is written in TypeScript 3.6. TypeScript will infer some of the return types from the passed generator function:

```
const variants = Array.from(
  createVariants(function*() {
    return {
      foo: yield [1, 2],
      bar: yield [true, false],
    };
  })
);

// typeof variants:
// Array<{ foo: any, bar: any }>
```
Unfortunately, I cannot infer the typings from `yield` statements. So those parts of the returned value become type `any`. If you rather have strict typings, you have to explicitly annotate them:

```
const variants = Array.from(
  createVariants<{ foo: number, bar: boolean }>(function*() {
    return {
      foo: yield [1, 2],
      bar: yield [true, false],
    };
  })
);
```

## iterateCombinations utility
Sometimes you may want to execute a piece of work for each combination, but you are not interested in any return value. You can force the returned iterable to go through each variation by passing it to `Array.from()`, but this may look somewhat counter-intuitive. For this use case this module provides an `iterateCombinations()` utility:

```js
const { iterateCombinations } = require('variant-generator');

iterateCombinations(function*() {
  const result = doSomeHeavyCalculation({
    input: {
      x: yield [0.2, 1.2],
      y: yield [Math.PI, 42],
    },
  });

  storeResultInFile(result);
});
```

> Don't give this util too much credit. The definition is literally: `g => { Array.from(createVariants(g)); }`
