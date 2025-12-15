import type { NextFunction, Request, Response } from "express";
import {
  cacheFeatureFlags,
  clientFeatureFlags,
  type FeatureFlagValue,
  readFeatureFlagsFromCache,
} from "../clients/feature-flags";

export const featureFlagsController = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const featureFlags = await readFeatureFlagsFromCache();
    res.status(200).json(featureFlags);
  } catch (e) {
    next(e);
  }
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const fetchAndCacheFeatureFlags = async (): Promise<{
  [key: string]: FeatureFlagValue;
}> => {
  const featureFlags = await clientFeatureFlags().catch((e) => {
    // biome-ignore lint/suspicious/noConsole: needed for logging
    console.error("💽[server]: Error polling feature flags:", e);
    return {};
  });

  await cacheFeatureFlags(featureFlags).catch((e) => {
    // biome-ignore lint/suspicious/noConsole: needed for logging
    console.error("💽[server]: Error caching feature flags:", e);
  });

  return featureFlags;
};

export const startPollingFeatureFlags = (): NodeJS.Timeout => {
  // biome-ignore lint/suspicious/noConsole: needed for logging
  console.log("💽[server]: Polling feature flags...");

  fetchAndCacheFeatureFlags();

  return setInterval(async () => {
    // biome-ignore lint/suspicious/noConsole: needed for logging
    console.log("💽[server]: Polling feature flags...");

    const featureFlags = await fetchAndCacheFeatureFlags();

    // biome-ignore lint/suspicious/noConsole: needed for logging
    console.log("💽[server]: Feature flags cached:", featureFlags);
  }, FIVE_MINUTES_MS);
};
