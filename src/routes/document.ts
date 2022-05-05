import {
  justificatifCreateJobController,
  justificatifJobStatusController,
} from '../controllers/justificatif';

var express = require('express'),
  documentRouter = express.Router();

documentRouter
  .get('/justificatif/job/:siren', justificatifCreateJobController)
  .post('/justificatif/job/status', justificatifJobStatusController);

export default documentRouter;
