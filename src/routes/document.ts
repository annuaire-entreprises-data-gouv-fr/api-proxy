import {
  justificatifController,
  justificatifCreateJobController,
  justificatifJobStatusController,
} from "../controllers/justificatif";

var express = require("express"),
  documentRouter = express.Router();

documentRouter
  .get("/justificatif/:siren", justificatifController)
  .get("/justificatif/job/:siren", justificatifCreateJobController)
  .post("/justificatif/job/status", justificatifJobStatusController);

export default documentRouter;
