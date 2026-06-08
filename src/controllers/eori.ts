import type { Handler } from "hono";
import clientEORI from "../clients/eori";
import { extractSirenFromSiret, verifySiret } from "../models/siren-and-siret";

export const eoriController: Handler<object, "/eori/:siret"> = async (c) => {
  try {
    const siret = verifySiret(c.req.param("siret"));
    const siren = extractSirenFromSiret(siret);

    // Try to validate with siren first, if it fails, try with siret
    let eoriValidation = await clientEORI(siren, c.req.raw.signal);

    if (!(eoriValidation?.isValid || c.req.raw.signal.aborted)) {
      eoriValidation = await clientEORI(siret, c.req.raw.signal);
    }
    return c.json(eoriValidation, 200);
  } catch (error) {
    // Don't forward abort errors to error handler since there's no client to respond to
    if (error instanceof Error && error.name === "CanceledError") {
      return c.body(null);
    }
    throw error;
  }
};
