import {
  justificatifCreateJobController,
  justificatifJobStatusController,
} from '../controllers/justificatif';

import express from 'express';

const documentRouter = express.Router();

documentRouter
  .get('/justificatif/job/:siren', justificatifCreateJobController)
  .post('/justificatif/job/status', justificatifJobStatusController);

export default documentRouter;
