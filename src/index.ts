type InputValue<T = any> = [Array<T>, T];
type TParentInputValues<TInputTypes extends Array<any>> = Array<InputValue<TInputTypes[number]>>;

const NO_RETURN_VALUE = Symbol('NO_RETURN_VALUE');

const NON_DETERMINISTIC_INPUT_ERROR = (msg: string, index: number) =>
  `The generator passed to createVariants() seems to yield non-deterministic input Arrays.
The generator should yield the same inputs on each call. Yield #${index} was inconsistent:
${msg}`;

function verifyInputEqual(previous: Array<any>, current: Array<any>, index: number): void {
  if (previous.length !== current.length) {
    throw new Error(
      NON_DETERMINISTIC_INPUT_ERROR(
        `inputs previously had length ${previous.length}, now yields ${current.length}`,
        index,
      ),
    );
  }

  for (let i = 0; i < previous.length; i++) {
    if (typeof previous[i] !== typeof current[i]) {
      throw new Error(
        NON_DETERMINISTIC_INPUT_ERROR(
          `input option ${i} was of type ${typeof previous[i]}, is now ${typeof current[i]}`,
          index,
        ),
      );
    }
  }
}

function* createVariants<TOutput>(
  variantGenerator: (isFirst: boolean) => Generator<Array<any>, TOutput, any>,
  parentInputValues: TParentInputValues<any> = [] as TParentInputValues<any>,
): Generator<TOutput, void, never> {
  if (typeof variantGenerator !== 'function') {
    throw new TypeError(
      `Unexpected argument passed to createVariants(). Expected a generator function, got ${typeof variantGenerator}`,
    );
  }

  const inputsIterator = variantGenerator(!parentInputValues.length);

  if (!inputsIterator || typeof inputsIterator.next !== 'function') {
    throw new Error('The function passed to createVariants() does not seem to be a generator function. Please use function*');
  }

  let i = 0;
  let { done, value: inputVariations } = inputsIterator.next();
  const inputValues = [...parentInputValues] as TParentInputValues<any>;

  while (!done) {
    if (!Array.isArray(inputVariations)) {
      throw new Error(
        `yielded values in createVariants() should be Arrays of options. Got ${typeof inputVariations}`,
      );
    }

    let returnValueToGenerator: unknown = NO_RETURN_VALUE;
    const currentParentInputValue = parentInputValues[i];

    if (currentParentInputValue !== undefined) {
      // input value already set by parent
      verifyInputEqual(currentParentInputValue[0], inputVariations, i);

      returnValueToGenerator = currentParentInputValue[1];
    } else {
      // check if yielded input variations array have been yielded before
      const existingInputValue = inputValues.find(
        ([parentInputVariations]) => parentInputVariations === inputVariations,
      );

      if (existingInputValue) {
        // same reference as previous yield
        inputValues.push([inputVariations, existingInputValue[1]]);
        returnValueToGenerator = existingInputValue[1];
      } else {
        // input value we have not seen before

        // recurse into createVariants for every variation of the input except the last one
        for (const childValue of inputVariations.slice(0, -1)) {
          const childInputValues = [...inputValues];
          childInputValues.push([inputVariations, childValue]);
          yield* createVariants<TOutput>(variantGenerator, childInputValues);
        }
        // move to next iteration with last variation of input
        inputValues.push([inputVariations, inputVariations[inputVariations.length - 1]]);
        returnValueToGenerator = inputVariations[inputVariations.length - 1];
      }
    }
    i++;
    if (returnValueToGenerator === NO_RETURN_VALUE) {
      throw new Error('Expected returnValueToGenerator to be set');
    }
    ({ done, value: inputVariations } = inputsIterator.next(returnValueToGenerator));
  }

  yield inputVariations as TOutput;
}

createVariants.iterateCombinations = function iterateCombinations<TOutput>(
  combinationGenerator: (isFirst: boolean) => Generator<Array<any>, TOutput, any>,
): void {
  Array.from(createVariants<TOutput>(combinationGenerator));
};

export = createVariants;
