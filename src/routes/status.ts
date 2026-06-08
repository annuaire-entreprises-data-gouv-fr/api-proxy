import { Hono } from "hono";
import { apiRneStatusController } from "../controllers/status";

const statusRouter = new Hono();

statusRouter.get("/rne", apiRneStatusController);

export default statusRouter;
