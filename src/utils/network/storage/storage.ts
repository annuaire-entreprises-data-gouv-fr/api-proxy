import { CACHE_TIMEOUT } from "../cache-config";
import { RedisStorage } from "./redis-storage";

export const storage = new RedisStorage(CACHE_TIMEOUT);
