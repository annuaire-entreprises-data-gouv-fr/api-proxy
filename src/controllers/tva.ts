import type { NextFunction, Request, Response } from "express";
import { clientTVA } from "../clients/tva";
import { verifyTVANumber } from "../models/siren-and-siret";

export const tvaController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const noCache = req.query?.noCache === "true";
    const tvaNumber = verifyTVANumber(req.params?.tvaNumber);
    const tva = await clientTVA(tvaNumber, noCache);
    res.status(200).json(tva);
  } catch (e) {
    next(e);
  }
};
