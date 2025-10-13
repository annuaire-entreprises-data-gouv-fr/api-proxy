import { storage } from "./storage";
import { logWarningInSentry } from "../../sentry";


class SmartCacheStorageException extends Error {
  public name: string;
  constructor({ name = 'SmartCacheStorageException', message = '' }) {
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
    try {
      // Try to get the value and its TTL
      const [value, ttl] = await Promise.all([
        storage.find(key),
        storage.getTTL(key),
      ]);

      if (value !== null && ttl > 0) {
        const age = expiration - ttl;

        // Value exists and is less than a week old
        if (age < freshTime) {
          return value;
        }

        // Value exists but is more than a week old - try to refresh
        try {
          const freshValue = await callback();
          await storage.set(key, freshValue, undefined, expiration);
          return freshValue;
        } catch (err) {
          // Callback failed, return stale value
          logWarningInSentry(
            new SmartCacheStorageException({
              message: `Callback failed for key ${key}, returning stale value: ${err instanceof Error ? err.message : 'Unknown error'}`,
            })
          );
          return value;
        }
      }

      // Key doesn't exist or has no TTL - fetch fresh data
      const freshValue = await callback();

      try {
        await storage.set(key, freshValue, undefined, expiration);
      } catch (err) {
        logWarningInSentry(
          new SmartCacheStorageException({
              message: `Failed to set key ${key}: ${err instanceof Error ? err.message : 'Unknown error'}`,
          })
        );
      }
      return freshValue;
    } catch (err) {
      // Redis error - try to get any existing value as fallback
      try {
        const value = await storage.find(key);
        if (value !== null) {
          logWarningInSentry(
            new SmartCacheStorageException({
              message: `Redis error for key ${key}, returning any available value: ${err instanceof Error ? err.message : 'Unknown error'}`,
            })
          );
          return value;
        }
      } catch {
        // Fallback also failed
      }

      // No cached value available, try callback as last resort
      try {
        const freshValue = await callback();
        // Try to cache it but don't fail if caching fails
        try {
          await storage.set(key, freshValue, undefined, expiration);
        } catch {
          // Ignore caching error
        }
        return freshValue;
      } catch (callbackErr) {
        const error = new SmartCacheStorageException({
          message: `Failed to get or set key ${key}: ${callbackErr instanceof Error ? callbackErr.message : 'Unknown error'}`,
        });

        logWarningInSentry(
          error
        );

        throw error;
      }
    }
  };