/**
 * Custom implementation of timeout for promise
 *
 * Always prefer the built-in alternative if it exists
 */

export class RedisPromiseTimeoutError extends Error {}

/**
 * Rejects a promise with a {@link RedisPromiseTimeoutError} if it does not settle within
 * the specified timeout.
 *
 * @param {Promise} promise The promise.
 * @param {number} timeoutMillis Number of milliseconds to wait on settling.
 * @returns {Promise} Either resolves/rejects with `promise`, or rejects with
 *                   `TimeoutError`, whichever settles first.
 */

export const redisPromiseTimeout = <T>(
  promise: Promise<T>,
  timeoutMillis: number
): Promise<T> => {
  let timeout: NodeJS.Timeout;

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timeout = setTimeout(() => {
        reject(new RedisPromiseTimeoutError("Redis client timeout"));
      }, timeoutMillis);
    }),
  ]).then(
    (v) => {
      clearTimeout(timeout);
      return v as T;
    },
    (err) => {
      clearTimeout(timeout);
      throw err;
    }
  );
};
