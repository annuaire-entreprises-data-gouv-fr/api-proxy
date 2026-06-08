import type { Handler } from "hono";
import clientUniteLegaleIG from "../clients/ig";
import { verifySiren } from "../models/siren-and-siret";

export const igController: Handler<object, "/ig/:siren"> = async (c) => {
  try {
    const siren = verifySiren(c.req.param("siren"));
    const response = await clientUniteLegaleIG(siren, c.req.raw.signal);
    return c.json(response, 200);
  } catch (error) {
    // Don't forward abort errors to error handler since there's no client to respond to
    if (error instanceof Error && error.name === "AbortError") {
      return c.body(null);
    }
    throw error;
  }
};
