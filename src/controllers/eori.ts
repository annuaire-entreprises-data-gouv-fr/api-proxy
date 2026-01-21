import type { NextFunction, Request, Response } from "express";
import clientEORI from "../clients/eori";
import { extractSirenFromSiret, verifySiret } from "../models/siren-and-siret";

export const eoriController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const abortController = new AbortController();

  // Cancel the request if client disconnects
  req.on("close", () => {
    abortController.abort();
  });

  try {
    const siret = verifySiret(req.params?.siret);
    const siren = extractSirenFromSiret(siret);

    // Try to validate with siren first, if it fails, try with siret
    let eoriValidation = await clientEORI(siren, abortController.signal);

    if (!(eoriValidation?.isValid || abortController.signal.aborted)) {
      eoriValidation = await clientEORI(siret, abortController.signal);
    }
    res.status(200).json(eoriValidation);
  } catch (error) {
    // Don't forward abort errors to error handler since there's no client to respond to
    if (error instanceof Error && error.name === "CanceledError") {
      return;
    }
    next(error);
  }
};
