import type { Context } from "hono";
import {
  cacheFeatureFlags,
  clientFeatureFlags,
  readFeatureFlagsFromCache,
} from "../clients/feature-flags";
import { logErrorInSentry } from "../utils/sentry";

export const featureFlagsController = async (c: Context) => {
  const featureFlags = await readFeatureFlagsFromCache();
  return c.json(featureFlags, 200);
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const fetchAndCacheFeatureFlags = async () => {
  console.log("💽[server]: Polling feature flags...");

  const featureFlags = await clientFeatureFlags().catch((e) => {
    console.error("💽[server]: Error polling feature flags:", e);

    logErrorInSentry(
      `Error polling feature flags : ${e instanceof Error ? e.message : "Unknown error"}`
    );
    return {};
  });

  await cacheFeatureFlags(featureFlags).catch((e) => {
    console.error("💽[server]: Error caching feature flags:", e);

    logErrorInSentry(
      `Error caching feature flags : ${e instanceof Error ? e.message : "Unknown error"}`
    );
  });

  console.log("💽[server]: Feature flags cached:", featureFlags);

  return featureFlags;
};

export const startPollingFeatureFlags = (): NodeJS.Timeout => {
  fetchAndCacheFeatureFlags();

  return setInterval(() => {
    fetchAndCacheFeatureFlags();
  }, FIVE_MINUTES_MS);
};
