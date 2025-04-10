/**
 * Custom implementation of timeout for promise
 *
 * Always prefer the built-in alternative if it exists
 */

export class RedisPromiseTimeoutError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

/**
 * Rejects a promise with a {@link RedisPromiseTimeoutError} if it does not settle within
 * the specified timeout.
 *
 * @param {Promise} promise The promise.
 * @param {number} timeoutMillis Number of milliseconds to wait on settling.
 * @returns {Promise} Either resolves/rejects with `promise`, or rejects with
 *                   `TimeoutError`, whichever settles first.
 */

export const redisPromiseTimeout = (
  promise: Promise<any>,
  timeoutMillis: number
) => {
  let timeout: NodeJS.Timeout;

  return Promise.race([
    promise,
    new Promise(function (resolve, reject) {
      timeout = setTimeout(function () {
        reject(new RedisPromiseTimeoutError('Redis client timeout'));
      }, timeoutMillis);
    }),
  ]).then(
    function (v) {
      clearTimeout(timeout);
      return v;
    },
    function (err) {
      clearTimeout(timeout);
      throw err;
    }
  );
};
