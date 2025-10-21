// biome-ignore lint/performance/noNamespaceImport: Sentry namespace needed
import * as Sentry from "@sentry/node";
import dotenv from "dotenv";
import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import { eoriController } from "./src/controllers/eori";
import { errorHandler } from "./src/controllers/error-handler";
import { igController } from "./src/controllers/ig";
import {
  rneControllerAPI,
  rneControllerObservationsSite,
} from "./src/controllers/rne";
import { tvaController } from "./src/controllers/tva";
import statusRouter from "./src/routes/status";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const useSentry =
  process.env.NODE_ENV === "production" && process.env.SENTRY_DSN;

// parse incoming request json body
app.use(express.json());

// https://expressjs.com/fr/advanced/best-practice-security.html
app.use(helmet());

/**
 * Error handling
 */

if (useSentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [],
  });

  // The error handler must be before any other error middleware and after all controllers
  Sentry.setupExpressErrorHandler(app);
}

/**
 * Up and running
 */
app.get("/", (_: Request, res: Response) => {
  res.json({ message: "Server is up and running" });
});

/**
 * RNE
 */
app.get("/rne/:siren", rneControllerAPI);

/**
 * RNE Fallback
 */
app.get("/rne/observations/fallback/:siren", rneControllerObservationsSite);

/**
 * Status
 */
app.use("/status", statusRouter);

/**
 * TVA
 */
app.use("/tva/:tvaNumber", tvaController);

/**
 * EORI
 */
app.use("/eori/:siret", eoriController);

/**
 * IG
 */
app.use("/ig/:siren", igController);

app.use(errorHandler);

app.listen(port, () => {
  // biome-ignore lint/suspicious/noConsole: needed for logging
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
