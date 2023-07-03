import { apiRneStatusController } from '../controllers/status';

import express from 'express';

const statusRouter = express.Router();

statusRouter.get('/rne/api', apiRneStatusController);

export default statusRouter;
