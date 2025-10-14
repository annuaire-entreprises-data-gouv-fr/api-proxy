import type { NextFunction, Request, Response } from "express";
import clientEORI from "../clients/eori";
import { extractSirenFromSiret, verifySiret } from "../models/siren-and-siret";

export const eoriController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siret = verifySiret(req.params?.siret);
    const siren = extractSirenFromSiret(siret);

    // Try to validate with siren first, if it fails, try with siret
    let eoriValidation = await clientEORI(siren);

    if (!eoriValidation?.isValid) {
      eoriValidation = await clientEORI(siret);
    }
    res.status(200).json(eoriValidation);
  } catch (e) {
    next(e);
  }
};
