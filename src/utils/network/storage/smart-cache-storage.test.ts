import { logWarningInSentry } from "../../sentry";
import { getOrSetWithCacheExpiry } from "./smart-cache-storage";
import { storage } from "./storage";

jest.mock("./storage", () => ({
  storage: {
    find: jest.fn(),
    getTTL: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock("../../sentry", () => ({
  logWarningInSentry: jest.fn(),
}));

describe("getOrSetWithCacheExpiry", () => {
  const mockCallback = jest.fn();
  const mockStorageFind = storage.find as jest.Mock;
  const mockStorageGetTTL = storage.getTTL as jest.Mock;
  const mockStorageSet = storage.set as jest.Mock;
  const mockLogWarningInSentry = logWarningInSentry as jest.Mock;

  const testKey = "test-key";
  const expiration = 1_000_000; // 1000 seconds
  const freshTime = 500_000; // 500 seconds

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("When value exists and is fresh", () => {
    test("Should return cached value without calling callback", async () => {
      const cachedValue = { data: "cached" };
      const ttl = 900_000; // 900 seconds remaining
      // age = expiration - ttl so 100 seconds old. less than freshTime 500 seconds

      mockStorageFind.mockResolvedValue(cachedValue);
      mockStorageGetTTL.mockResolvedValue(ttl);

      const result = await getOrSetWithCacheExpiry(
        testKey,
        mockCallback,
        expiration,
        freshTime
      );

      expect(result).toEqual(cachedValue);
      expect(mockCallback).not.toHaveBeenCalled();
      expect(mockStorageFind).toHaveBeenCalledWith(testKey);
      expect(mockStorageGetTTL).toHaveBeenCalledWith(testKey);
    });
  });

  describe("When value exists but is stale", () => {
    test("Should refresh value successfully and return fresh data", async () => {
      const staleValue = { data: "stale" };
      const freshValue = { data: "fresh" };
      const smallFreshTime = 500_000; // 500 seconds
      const ttl = 10; // age will be 1000000. More than freshTime 500 seconds

      mockStorageFind.mockResolvedValue(staleValue);
      mockStorageGetTTL.mockResolvedValue(ttl);
      mockCallback.mockResolvedValue(freshValue);
      mockStorageSet.mockResolvedValue(undefined);

      const result = await getOrSetWithCacheExpiry(
        testKey,
        mockCallback,
        expiration,
        smallFreshTime
      );

      expect(result).toEqual(freshValue);
      expect(mockCallback).toHaveBeenCalled();
      expect(mockStorageSet).toHaveBeenCalledWith(
        testKey,
        freshValue,
        undefined,
        expiration
      );
    });

    test("Should return stale value when callback fails", async () => {
      const staleValue = { data: "stale" };
      const ttl = 10; // Very low TTL = old value
      const smallFreshTime = 500_000;
      const callbackError = new Error("Callback failed");

      mockStorageFind.mockResolvedValue(staleValue);
      mockStorageGetTTL.mockResolvedValue(ttl);
      mockCallback.mockRejectedValue(callbackError);

      const result = await getOrSetWithCacheExpiry(
        testKey,
        mockCallback,
        expiration,
        smallFreshTime
      );

      expect(result).toEqual(staleValue);
      expect(mockLogWarningInSentry).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "SmartCacheStorageException",
          message: expect.stringContaining("Callback failed for key"),
        })
      );
    });
  });

  describe("When key doesn't exist", () => {
    test("Should call callback and cache the result", async () => {
      const freshValue = { data: "fresh" };

      mockStorageFind.mockResolvedValue(null);
      mockStorageGetTTL.mockResolvedValue(null);
      mockCallback.mockResolvedValue(freshValue);
      mockStorageSet.mockResolvedValue(undefined);

      const result = await getOrSetWithCacheExpiry(
        testKey,
        mockCallback,
        expiration,
        freshTime
      );

      expect(result).toEqual(freshValue);
      expect(mockCallback).toHaveBeenCalled();
      expect(mockStorageSet).toHaveBeenCalledWith(
        testKey,
        freshValue,
        undefined,
        expiration
      );
    });
  });

  describe("When callback fails", () => {
    test("Should throw error when no cache exists and callback fails", async () => {
      const callbackError = new Error("Callback failed");

      mockStorageFind.mockResolvedValue(null);
      mockStorageGetTTL.mockResolvedValue(null);
      mockCallback.mockRejectedValue(callbackError);

      await expect(
        getOrSetWithCacheExpiry(testKey, mockCallback, expiration, freshTime)
      ).rejects.toThrow("Callback failed");
    });
  });

  describe("Edge cases", () => {
    test("Should handle TTL of 0", async () => {
      const cachedValue = { data: "cached" };
      const freshValue = { data: "fresh" };

      mockStorageFind.mockResolvedValue(cachedValue);
      mockStorageGetTTL.mockResolvedValue(0);
      mockCallback.mockResolvedValue(freshValue);
      mockStorageSet.mockResolvedValue(undefined);

      const result = await getOrSetWithCacheExpiry(
        testKey,
        mockCallback,
        expiration,
        freshTime
      );

      // TTL of 0 or less means key doesn't exist or expired, should call callback
      expect(mockCallback).toHaveBeenCalled();
      expect(result).toEqual(freshValue);
    });

    test("Should handle null TTL (key doesn't exist)", async () => {
      const freshValue = { data: "fresh" };

      mockStorageFind.mockResolvedValue(null);
      mockStorageGetTTL.mockResolvedValue(null);
      mockCallback.mockResolvedValue(freshValue);
      mockStorageSet.mockResolvedValue(undefined);

      const result = await getOrSetWithCacheExpiry(
        testKey,
        mockCallback,
        expiration,
        freshTime
      );

      expect(result).toEqual(freshValue);
      expect(mockCallback).toHaveBeenCalled();
    });

    test("Should handle callback returning null", async () => {
      mockStorageFind.mockResolvedValue(null);
      mockStorageGetTTL.mockResolvedValue(null);
      mockCallback.mockResolvedValue(null);
      mockStorageSet.mockResolvedValue(undefined);

      const result = await getOrSetWithCacheExpiry(
        testKey,
        mockCallback,
        expiration,
        freshTime
      );

      expect(result).toBeNull();
      expect(mockStorageSet).toHaveBeenCalledWith(
        testKey,
        null,
        undefined,
        expiration
      );
    });

    test("Should handle callback returning undefined", async () => {
      mockStorageFind.mockResolvedValue(null);
      mockStorageGetTTL.mockResolvedValue(null);
      mockCallback.mockResolvedValue(undefined);
      mockStorageSet.mockResolvedValue(undefined);

      const result = await getOrSetWithCacheExpiry(
        testKey,
        mockCallback,
        expiration,
        freshTime
      );

      expect(result).toBeUndefined();
      expect(mockStorageSet).toHaveBeenCalledWith(
        testKey,
        undefined,
        undefined,
        expiration
      );
    });
  });
});
