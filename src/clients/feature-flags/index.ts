import fs from "node:fs";
import constants from "../../constants";
import { storage } from "../../utils/network/storage/storage";
import { readFromGrist } from "../external-tooling/grist";

export type FeatureFlagValue = boolean | string;

let featureFlagsPromise: Promise<{ [key: string]: FeatureFlagValue }> | null =
  null;

export const clientFeatureFlags = async (): Promise<{
  [key: string]: FeatureFlagValue;
}> => {
  const callback = async () => {
    const response: { feature_name: string; value: FeatureFlagValue }[] =
      await readFromGrist("feature-flags");

    return response
      .filter((row) => !!row.feature_name)
      .reduce(
        (acc: { [key: string]: FeatureFlagValue }, row) => {
          acc[row.feature_name] = row.value;
          return acc;
        },
        {} as { [key: string]: FeatureFlagValue }
      );
  };

  featureFlagsPromise = callback();

  const featureFlags = await featureFlagsPromise;

  featureFlagsPromise = null;

  return featureFlags;
};

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export const cacheFeatureFlags = async (featureFlags: {
  [key: string]: FeatureFlagValue;
}): Promise<void> => {
  try {
    await storage.set("feature-flags", featureFlags, undefined, ONE_MONTH_MS);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: needed for logging
    console.error(
      `💽[server]: Error caching feature flags: ${error instanceof Error ? error.message : "Unknown error"}. Writing to file...`
    );

    fs.writeFileSync(
      "feature-flags.json",
      JSON.stringify(featureFlags, null, 2)
    );
  }
};

export const readFeatureFlagsFromCache = async (): Promise<{
  [key: string]: FeatureFlagValue;
}> => {
  const featureFlags = await storage.find("feature-flags");

  if (featureFlags) {
    return featureFlags;
  }

  if (featureFlagsPromise) {
    const result = await Promise.race([
      featureFlagsPromise,
      new Promise<void>((resolve) =>
        setTimeout(() => resolve(), constants.timeout.S)
      ),
    ]);

    if (result) {
      return result;
    }
  }

  const fileContent = fs.readFileSync("feature-flags.json", "utf8");

  return JSON.parse(fileContent ?? "{}") ?? {};
};
