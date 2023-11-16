import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { rneController } from './src/controllers/rne';
import { errorHandler } from './src/controllers/errorHandler';
import { associationController } from './src/controllers/association';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import helmet from 'helmet';
import statusRouter from './src/routes/status';
import {
  rneActesDownloadController,
  rneListActesController,
} from './src/controllers/rne-actes';

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

    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],

    tracesSampler: (samplingContext) => {
      const path = samplingContext?.location?.pathname || '';

      return path.indexOf('/status') === -1;
    },
  });

  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
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
app.get('/rne/:siren', rneController);

/**
 * RNE
 */
app.get('/rne/actes/:siren', rneListActesController);
app.get('/rne/actes/download/:id', rneActesDownloadController);

// /**
//  * KBIS
//  */
// app.use('/document', documentRouter);

/**
 * Status
 */
app.use('/status', statusRouter);

/**
 * Association
 */
app.use('/association/:rna', associationController);

/**
 * Error handling
 */

if (useSentry) {
  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());
}

app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
