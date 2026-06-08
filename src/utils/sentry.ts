// biome-ignore lint/performance/noNamespaceImport: Sentry namespace needed
import * as Sentry from "@sentry/node";
import { RedisStorageException } from "./network/storage/redis-storage";

export interface IScope {
  browser?: string;
  details?: string;
  page?: string;
  referrer?: string;
  siren?: string;
  siret?: string;
}

// scope allows to log stuff in tags in sentry
const getScope = (extra: IScope) => {
  const scope = new Sentry.Scope();
  for (const key of Object.keys(extra)) {
    //@ts-expect-error
    scope.setTag(key, extra[key] || "N/A");
  }
  return scope;
};

export const logInSentryFactory =
  (severity = "error" as Sentry.SeverityLevel) =>
  (errorMsg: unknown, extra?: IScope) => {
    const shouldLogInSentry =
      process.env.NODE_ENV === "production" && process.env.SENTRY_DSN && Sentry;

    if (shouldLogInSentry) {
      const scope = getScope(extra || {});
      scope.setLevel(severity);

      if (typeof errorMsg === "string") {
        Sentry.captureMessage(errorMsg, scope);
      } else {
        Sentry.captureException(errorMsg, scope);
      }
      // Avoid logging RedisStorageException in local development
    } else if (!(errorMsg instanceof RedisStorageException)) {
      console.log(errorMsg, JSON.stringify(extra || {}));
    }
  };

export const logWarningInSentry = logInSentryFactory(
  "info" as Sentry.SeverityLevel
);

export const logErrorInSentry = logInSentryFactory(
  "error" as Sentry.SeverityLevel
);

export default logErrorInSentry;
