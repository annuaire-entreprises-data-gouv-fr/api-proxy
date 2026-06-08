import type { Handler } from "hono";
import { fetchRneAPI, fetchRneObservationsSite } from "../models/rne";
import { verifySiren } from "../models/siren-and-siret";

export const rneControllerAPI: Handler<object, "/rne/:siren"> = async (c) => {
  try {
    const siren = verifySiren(c.req.param("siren"));
    const rne = await fetchRneAPI(siren, c.req.raw.signal);
    return c.json(rne, 200);
  } catch (error) {
    // Don't forward abort errors to error handler since there's no client to respond to
    if (error instanceof Error && error.name === "CanceledError") {
      return c.body(null);
    }
    throw error;
  }
};

export const rneControllerObservationsSite: Handler<
  object,
  "/rne/observations/fallback/:siren"
> = async (c) => {
  try {
    const siren = verifySiren(c.req.param("siren"));
    const observations = await fetchRneObservationsSite(
      siren,
      c.req.raw.signal
    );
    return c.json(observations, 206);
  } catch (error) {
    // Don't forward abort errors to error handler since there's no client to respond to
    if (error instanceof Error && error.name === "CanceledError") {
      return c.body(null);
    }
    throw error;
  }
};
