import { logWarningInSentry } from "../../sentry";
import { storage } from "./storage";

class SmartCacheStorageException extends Error {
  name: string;

  constructor({ name = "SmartCacheStorageException", message = "" }) {
    super(message);
    this.name = name;
  }
}

/**
 * Get or set an item with smart cache expiry system.
 * - If key exists and is less than freshTime old: returns cached value
 * - If key exists but is more than freshTime old: tries to refresh, falls back to old value on error
 * - If key doesn't exist: calls callback and caches for expiration
 *
 * @param key - The Redis key
 * @param callback - Function to fetch fresh data
 * @param expiration - The expiration time in milliseconds
 * @param freshTime - The time to consider the value as fresh in milliseconds
 * @returns The cached or fresh value. Throws if no value can be retrieved.
 */
export const getOrSetWithCacheExpiry = async (
  key: string,
  callback: () => Promise<any>,
  expiration: number,
  freshTime: number
): Promise<any> => {
  const [value, ttl] = await Promise.all([
    storage.find(key),
    storage.getTTL(key),
  ]);

  if (value !== null && ttl !== null && ttl > 0) {
    const age = expiration - ttl;

    if (age < freshTime) {
      return value;
    }

    return await refreshStaleValue(key, value, callback, expiration);
  }

  try {
    return await fetchAndCache(key, callback, expiration);
  } catch (err) {
    return handleErrorFallback(key, callback, expiration, err);
  }
};

/**
 * Refreshes a stale cached value by calling fetchAndCache.
 * Falls back to the stale value if fetchAndCache fails.
 */
const refreshStaleValue = async (
  key: string,
  staleValue: any,
  callback: () => Promise<any>,
  expiration: number
): Promise<any> => {
  try {
    return await fetchAndCache(key, callback, expiration);
  } catch (err) {
    logWarningInSentry(
      new SmartCacheStorageException({
        message: `Callback failed for key ${key}, returning stale value: ${err instanceof Error ? err.message : "Unknown error"}`,
      })
    );
    return staleValue;
  }
};

/**
 * Fetches fresh data and attempts to cache it.
 * Returns the fresh value even if caching fails.
 */
const fetchAndCache = async (
  key: string,
  callback: () => Promise<any>,
  expiration: number
): Promise<any> => {
  const freshValue = await callback();

  await storage.set(key, freshValue, undefined, expiration);

  return freshValue;
};

/**
 * Handles the case when Redis operations fail.
 * Tries to fallback to any cached value, then to callback.
 */
const handleErrorFallback = async (
  key: string,
  callback: () => Promise<any>,
  expiration: number,
  originalError: any
): Promise<any> => {
  // Try to get any existing cached value
  const value = await storage.find(key);
  if (value !== null) {
    logWarningInSentry(
      new SmartCacheStorageException({
        message: `Redis error for key ${key}, returning any available value: ${originalError instanceof Error ? originalError.message : "Unknown error"}`,
      })
    );
    return value;
  }

  // No cached value available, try callback as last resort
  try {
    return await fetchAndCache(key, callback, expiration);
  } catch (callbackErr) {
    const error = new SmartCacheStorageException({
      message: `Failed to get or set key ${key}: ${callbackErr instanceof Error ? callbackErr.message : "Unknown error"}`,
    });

    logWarningInSentry(error);
    throw error;
  }
};
