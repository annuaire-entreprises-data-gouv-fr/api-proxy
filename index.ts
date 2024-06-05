import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { rneController } from './src/controllers/rne';
import { errorHandler } from './src/controllers/errorHandler';
import { associationController } from './src/controllers/association';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import helmet from 'helmet';
import statusRouter from './src/routes/status';
import { rneListDocumentsController } from './src/controllers/rne-document';
import {
  rneActeDownloadController,
  rneBilanDownloadController,
} from './src/controllers/rne-download';
import { tvaController } from './src/controllers/tva';

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

// list documents
app.get('/rne/documents/:siren', rneListDocumentsController);

// download an acte
app.get('/rne/download/acte/:id', rneActeDownloadController);

// download a bilan
app.get('/rne/download/bilan/:id', rneBilanDownloadController);

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
