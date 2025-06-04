import { BuildStorage } from 'axios-cache-interceptor';
import { createClient } from 'redis';
import { redisPromiseTimeout } from './redis-timeout';
import { logWarningInSentry } from '../../sentry';
import { performance } from 'perf_hooks';

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
      this._eventLoopLag = now - this._lastLoop - 10000;
      this._lastLoop = now;
    }, 10000);

    this._client = createClient({
      url: process.env.REDIS_URL,
      pingInterval: 1000,
    });

    this._client.on('error', (err) => {
      logWarningInSentry(
        new RedisStorageException({
          message: err.message || 'Redis client error',
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
            message: 'Could not connect to redis client',
          })
        );
      }
    }
  }

  find = async (key: string) => {
    await this.connect();
    const start = performance.now();
    const result = await redisPromiseTimeout(this._client.get(key), 100).catch(
      (err) => {
        const duration = performance.now() - start;
        const message =(err.message || 'Could not get key') +` [Redis timeout=100ms, elapsed=${Math.round(duration)}ms, enventLoopLag=${Math.round(this._eventLoopLag)}ms]`;
        logWarningInSentry(
          new RedisStorageException({
            message: message,
          })
        );
        return null;
      }
    );

    return result ? JSON.parse(result) : result;
  };

  set = async (key: string, value: any) => {
    await this.connect();
    await redisPromiseTimeout(
      this._client.set(key, JSON.stringify(value), {
        PX: this.cache_timeout,
      }),
      200
    ).catch((err) => {
      logWarningInSentry(
        new RedisStorageException({
          message: err.message || 'Could not set key',
        })
      );
    });
  };

  remove = async (key: string) => {
    await this.connect();
    await this._client.del(key);
  };
}

class RedisStorageException extends Error {
  public name: string;
  constructor({ name = 'RedisStorageException', message = '' }) {
    super(message);
    this.name = name;
  }
}
