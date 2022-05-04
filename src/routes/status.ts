import {
  apiImrStatusController,
  siteImrStatusController,
} from '../controllers/status';

var express = require('express'),
  statusRouter = express.Router();

statusRouter
  .get('/imr/site', siteImrStatusController)
  .get('/imr/api', apiImrStatusController);

export default statusRouter;
