import { serve } from "@hono/node-server";
// biome-ignore lint/performance/noNamespaceImport: Sentry namespace needed
import * as Sentry from "@sentry/node";
import dotenv from "dotenv";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { eoriController } from "./src/controllers/eori";
import { errorHandler } from "./src/controllers/error-handler";
import {
  featureFlagsController,
  startPollingFeatureFlags,
} from "./src/controllers/feature-flags";
import { igController } from "./src/controllers/ig";
import {
  rneControllerAPI,
  rneControllerImmatriculationDate,
  rneControllerObservationsSite,
} from "./src/controllers/rne";
import statusRouter from "./src/routes/status";

dotenv.config();

const app = new Hono();
const port = process.env.PORT || 3000;
const useSentry =
  process.env.NODE_ENV === "production" && process.env.SENTRY_DSN;
const SENTRY_DENIED_KEYS = ["forwarded", "-ip", "remote-", "via", "-user"];

// https://hono.dev/docs/middleware/builtin/secure-headers
app.use(secureHeaders());

/**
 * Error handling
 */

if (useSentry) {
  Sentry.init({
    // Sentry v11 defaults to attaching stack traces to captureMessage events,
    // which would regroup existing issues. Keep the v10 behavior.
    attachStacktrace: false,
    // Sentry v11 collects cookies, bodies and user info by default.
    // Keep the v10 restrictive baseline.
    // https://github.com/getsentry/sentry-javascript/blob/develop/MIGRATION.md#if-you-want-to-keep-the-v10-default-behavior
    dataCollection: {
      cookies: false,
      databaseQueryData: false,
      genAI: { inputs: false, outputs: false },
      graphQL: { document: false, variables: false },
      httpBodies: [],
      httpHeaders: {
        request: { deny: SENTRY_DENIED_KEYS },
        response: { deny: SENTRY_DENIED_KEYS },
      },
      queues: false,
      urlQueryParams: { deny: SENTRY_DENIED_KEYS },
      userInfo: false,
    },
    dsn: process.env.SENTRY_DSN,
    integrations: [],
  });
}

/**
 * Up and running
 */
app.get("/", (c) => c.json({ message: "Server is up and running" }));

/**
 * RNE
 */
app.get("/rne/:siren/date", rneControllerImmatriculationDate);
app.get("/rne/:siren", rneControllerAPI);

/**
 * RNE Fallback
 */
app.get("/rne/observations/fallback/:siren", rneControllerObservationsSite);

/**
 * Status
 */
app.route("/status", statusRouter);

/**
 * EORI
 */
app.get("/eori/:siret", eoriController);

/**
 * IG
 */
app.get("/ig/:siren", igController);

/**
 * Feature Flags
 */
app.get("/feature-flags", featureFlagsController);

app.onError((err, c) => {
  if (useSentry) {
    Sentry.captureException(err);
  }

  return errorHandler(err, c);
});

let pollingTimeout: NodeJS.Timeout;

const server = serve(
  {
    fetch: app.fetch,
    port: Number(port),
  },
  () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);

    console.log("💽[server]: Polling feature flags every 5 minutes...");

    pollingTimeout = startPollingFeatureFlags();
  }
);

process.on("SIGINT", () => {
  console.log("💽[server]: Server is shutting down..");
  clearInterval(pollingTimeout);
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("💽[server]: Server is shutting down...");
  clearInterval(pollingTimeout);
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
