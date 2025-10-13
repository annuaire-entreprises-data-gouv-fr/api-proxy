import express from "express";
import { apiRneStatusController } from "../controllers/status";

const statusRouter = express.Router();

statusRouter.get("/rne", apiRneStatusController);

export default statusRouter;
