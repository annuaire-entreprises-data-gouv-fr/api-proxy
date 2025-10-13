import { RedisStorage } from "./redis-storage";
import { CACHE_TIMEOUT } from "../cache-config";

export const storage = new RedisStorage(CACHE_TIMEOUT);