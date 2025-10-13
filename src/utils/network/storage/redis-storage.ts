import type { BuildStorage } from "axios-cache-interceptor";
import { performance } from "perf_hooks";
import { createClient } from "redis";
import { logWarningInSentry } from "../../sentry";
import { redisPromiseTimeout } from "./redis-timeout";

export class RedisStorage implements BuildStorage {
  private _client;
  private _eventLoopLag;
  private _lastLoop;

  constructor(private cache_timeout: number) {
    // Mesure de l'event loop lag toutes les 10 secondes
    this._lastLoop = performance.now();
    this._eventLoopLag = 0;
    setInterval(() => {
      const now = performance.now();
      this._eventLoopLag = now - this._lastLoop - 10_000;
      this._lastLoop = now;
    }, 10_000);

    this._client = createClient({
      url: process.env.REDIS_URL,
      pingInterval: 1000,
    });

    this._client.on("error", (err) => {
      logWarningInSentry(
        new RedisStorageException({
          message: err.message || "Redis client error",
        })
      );
    });
  }

  private async connect() {
    if (!this._client.isOpen) {
      try {
        return this._client.connect();
      } catch {
        logWarningInSentry(
          new RedisStorageException({
            message: "Could not connect to redis client",
          })
        );
      }
    }
  }

  find = async (key: string) => {
    await this.connect();
    const start = performance.now();
    let result: string | null = null;
    let error: any = null;

    // Premier essai
    try {
      result = await redisPromiseTimeout(this._client.get(key), 100);
    } catch (err) {
      error = err;
    }

    // Retry en cas de timeout ou d'erreur
    if (error) {
      try {
        result = await redisPromiseTimeout(this._client.get(key), 100);
        error = null;
      } catch (err) {
        error = err;
      }
    }

    if (error) {
      const duration = performance.now() - start;
      const message =
        (error.message || "Could not get key") +
        ` [Redis timeout=100ms, elapsed=${Math.round(duration)}ms, enventLoopLag=${Math.round(this._eventLoopLag)}ms]`;
      logWarningInSentry(
        new RedisStorageException({
          message,
        })
      );
      return null;
    }

    return result ? JSON.parse(result) : result;
  };

  set = async (key: string, value: any, _: any, ttl = this.cache_timeout) => {
    await this.connect();
    await redisPromiseTimeout(
      this._client.set(key, JSON.stringify(value), {
        expiration: {
          type: "PX",
          value: ttl,
        },
      }),
      200
    ).catch((err) => {
      logWarningInSentry(
        new RedisStorageException({
          message: err.message || "Could not set key",
        })
      );
    });
  };

  getTTL = async (key: string) => {
    await this.connect();
    let result: number | null = null;
    let error: any = null;

    try {
      result = await redisPromiseTimeout(this._client.pTTL(key), 100);
    } catch (err) {
      error = err;
    }

    if (error) {
      try {
        result = await redisPromiseTimeout(this._client.pTTL(key), 100);
        error = null;
      } catch (err) {
        error = err;
      }
    }

    if (error) {
      logWarningInSentry(
        new RedisStorageException({
          message: error.message || "Could not get TTL",
        })
      );

      return null;
    }

    return result;
  };

  remove = async (key: string) => {
    await this.connect();
    await this._client.del(key);
  };
}

class RedisStorageException extends Error {
  public name: string;
  constructor({ name = "RedisStorageException", message = "" }) {
    super(message);
    this.name = name;
  }
}
