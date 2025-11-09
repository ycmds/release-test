import * as assert from 'node:assert';
import { describe, test } from 'node:test';

import { delay, map } from '../src/index.js';

const mapper = async (val: number | Promise<number>) => (await val) * 2;
const deferredMapper = async (val: number | Promise<number>) => {
  await delay(1);
  return (await val) * 2;
};

describe('map – test', () => {
  test('should map input values array', async () => {
    const input = [1, 2, 3];
    const results = await map(input, mapper);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should map input promises array', async () => {
    const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
    const results = await map(input, mapper);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should map mixed input array', async () => {
    const input = [1, Promise.resolve(2), 3];
    const results = await map(input, mapper);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should map input when mapper returns a promise', async () => {
    const input = [1, 2, 3];
    const results = await map(input, deferredMapper);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should map input promises when mapper returns a promise', async () => {
    const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
    const results = await map(input, deferredMapper);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should accept a promise for an array', async () => {
    const input = [1, Promise.resolve(2), 3];
    const results = await map(input, deferredMapper);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should throw a TypeError when input promise does not resolve to an array', async () => {
    const input = Promise.resolve(123);
    await assert.rejects(
      async () => {
        // @ts-expect-error
        await map(input, mapper);
      },
      TypeError,
    );
  });

  test('should reject when input contains rejection', async () => {
    const input = [Promise.resolve(1), Promise.reject(2), Promise.resolve(3)];
    await assert.rejects(
      async () => {
        await map(input, mapper);
      },
      (error: unknown) => {
        assert.strictEqual(error, 2);
        return true;
      },
    );
  });

  test('should call mapper asynchronously on values array', async () => {
    const input = [1, 2, 3];
    let calls = 0;
    const counterMapper = () => calls++;
    await map(input, counterMapper);
    assert.strictEqual(calls, 3);
  });

  test('should call mapper asynchronously on mixed array', async () => {
    const input = [1, Promise.resolve(2), 3];
    let calls = 0;
    const counterMapper = () => calls++;
    await map(input, counterMapper);
    assert.strictEqual(calls, 3);
  });
});



const concurrency = { concurrency: 2 };

describe('map – test with concurrency', () => {
  test('wrong concurrency', async () => {
    const input = [1, 2, 3];
    await assert.rejects(
      async () => {
        // @ts-expect-error
        await map(input, mapper, { concurrency: '3' });
      },
      TypeError,
    );
  });

  test('empty options', async () => {
    const input = [1, 2, 3];
    const results = await map(input, mapper);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('empty option concurrency', async () => {
    const input = [1, 2, 3];
    const results = await map(input, mapper, {});
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should map input values array with concurrency', async () => {
    const input = [1, 2, 3];
    const results = await map(input, mapper, concurrency);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should map input promises array with concurrency', async () => {
    const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
    const results = await map(input, mapper, concurrency);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should map mixed input array with concurrency', async () => {
    const input = [1, Promise.resolve(2), 3];
    const results = await map(input, mapper, concurrency);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should map input when mapper returns a promise with concurrency', async () => {
    const input = [1, 2, 3];
    const results = await map(input, deferredMapper, concurrency);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should map input promises when mapper returns a promise with concurrency', async () => {
    const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
    const results = await map(input, deferredMapper, concurrency);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should accept a promise for an array with concurrency', async () => {
    const input = [1, Promise.resolve(2), 3];
    const results = await map(input, deferredMapper, concurrency);
    assert.deepStrictEqual(results, [2, 4, 6]);
  });

  test('should reject when input contains rejection with concurrency', async () => {
    const input = [Promise.resolve(1), Promise.reject(2), Promise.resolve(3)];
    await assert.rejects(
      async () => {
        await map(input, mapper, concurrency);
      },
      (error: unknown) => {
        assert.strictEqual(error, 2);
        return true;
      },
    );
  });

  test('should not have more than {concurrency} promises in flight', async () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const immediates: any[] = [];
    function immediate(index: number) {
      let resolve: ((value: unknown) => void) | undefined;
      const promise = new Promise((res) => {
        resolve = res;
      });
      immediates.push({ promise, resolve, index });
      return promise;
    }

    const lates: any[] = [];
    function late(index: number) {
      let resolve: ((value: unknown) => void) | undefined;
      const promise = new Promise((res) => {
        resolve = res;
      });
      lates.push({ promise, resolve, index });
      return promise;
    }

    function promiseByIndex(index: number) {
      return index < 5 ? immediate(index) : late(index);
    }

    const tempResults: any[] = [];
    const ret1 = map(
      input,
      (value: any, index?: number) => {
        return promiseByIndex(index ?? 0).then(() => {
          tempResults.push(value);
        });
      },
      { concurrency: 5 },
    );

    const ret2 = delay(100)
      .then(() => {
        assert.strictEqual(tempResults.length, 0);
        for (const item of immediates) {
          item.resolve(item.index);
        }
        return Promise.all(immediates.map((item) => item.promise));
      })
      .then(() => delay(100))
      .then(() => {
        assert.deepStrictEqual(tempResults, [0, 1, 2, 3, 4]);
        for (const item of lates) {
          item.resolve(item.index);
        }
      })
      .then(() => delay(100))
      .then(() => {
        assert.deepStrictEqual(tempResults, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const item of lates) {
          item.resolve(item.index);
        }
      })
      .then(() => ret1)
      .then(() => {
        assert.deepStrictEqual(tempResults, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      });

    await Promise.all([ret1, ret2]);
  });
});
