import type { Handler } from "hono";
import { clientTVA } from "../clients/tva";
import { verifyTVANumber } from "../models/siren-and-siret";

export const tvaController: Handler<object, "/tva/:tvaNumber"> = async (c) => {
  try {
    const useCache = c.req.query("useCache") !== "false";
    const tvaNumber = verifyTVANumber(c.req.param("tvaNumber"));
    const tva = await clientTVA(tvaNumber, useCache, c.req.raw.signal);
    return c.json(tva, 200);
  } catch (error) {
    // Don't forward abort errors to error handler since there's no client to respond to
    if (error instanceof Error && error.name === "CanceledError") {
      return c.body(null);
    }
    throw error;
  }
};
