import dotenv from "dotenv";
import { CACHE_TIMEOUT } from "../cache-config";
import { RedisStorage, RedisStorageMock } from "./redis-storage";

dotenv.config();

export const storage =
  process.env.USE_MOCK_STORAGE === "true"
    ? new RedisStorageMock()
    : new RedisStorage(CACHE_TIMEOUT);
