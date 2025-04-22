import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { associationController } from './src/controllers/association';
import { eoriController } from './src/controllers/eori';
import { errorHandler } from './src/controllers/errorHandler';
import { igController } from './src/controllers/ig';
import { rneControllerAPI, rneControllerSite } from './src/controllers/rne';
import { tvaController } from './src/controllers/tva';
import statusRouter from './src/routes/status';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const useSentry =
  process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN;

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
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Server is up and running' });
});

/**
 * RNE
 */
app.get('/rne/:siren', rneControllerAPI);

/**
 * RNE Fallback
 */
app.get('/rne/fallback/:siren', rneControllerSite);

/**
 * Status
 */
app.use('/status', statusRouter);

/**
 * Association
 */
app.use('/association/:rna', associationController);

/**
 * TVA
 */
app.use('/tva/:tvaNumber', tvaController);

/**
 * EORI
 */
app.use('/eori/:siret', eoriController);

/**
 * IG
 */
app.use('/ig/:siren', igController);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
