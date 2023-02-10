import {
  apiImrStatusController,
  apiRneStatusController,
  siteImrStatusController,
} from '../controllers/status';

import express from 'express';

const statusRouter = express.Router();

statusRouter
  .get('/imr/site', siteImrStatusController)
  .get('/imr/api', apiImrStatusController)
  .get('/rne/api', apiRneStatusController);

export default statusRouter;
