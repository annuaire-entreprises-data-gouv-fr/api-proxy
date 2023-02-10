import {
  apiImrStatusController,
  siteImrStatusController,
} from '../controllers/status';

import express from 'express';

const statusRouter = express.Router();

statusRouter
  .get('/imr/site', siteImrStatusController)
  .get('/imr/api', apiImrStatusController)
  .get('/rne/api', apiImrStatusController);

export default statusRouter;
