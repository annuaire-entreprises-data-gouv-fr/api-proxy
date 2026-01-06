import type { NextFunction, Request, Response } from "express";
import {
  cacheFeatureFlags,
  clientFeatureFlags,
  readFeatureFlagsFromCache,
} from "../clients/feature-flags";
import { logErrorInSentry } from "../utils/sentry";

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

const fetchAndCacheFeatureFlags = async () => {
  // biome-ignore lint/suspicious/noConsole: needed for logging
  console.log("💽[server]: Polling feature flags...");

  const featureFlags = await clientFeatureFlags().catch((e) => {
    // biome-ignore lint/suspicious/noConsole: needed for logging
    console.error("💽[server]: Error polling feature flags:", e);

    logErrorInSentry(
      `Error polling feature flags : ${e instanceof Error ? e.message : "Unknown error"}`
    );
    return {};
  });

  await cacheFeatureFlags(featureFlags).catch((e) => {
    // biome-ignore lint/suspicious/noConsole: needed for logging
    console.error("💽[server]: Error caching feature flags:", e);

    logErrorInSentry(
      `Error caching feature flags : ${e instanceof Error ? e.message : "Unknown error"}`
    );
  });

  // biome-ignore lint/suspicious/noConsole: needed for logging
  console.log("💽[server]: Feature flags cached:", featureFlags);

  return featureFlags;
};

export const startPollingFeatureFlags = (): NodeJS.Timeout => {
  fetchAndCacheFeatureFlags();

  return setInterval(() => {
    fetchAndCacheFeatureFlags();
  }, FIVE_MINUTES_MS);
};
