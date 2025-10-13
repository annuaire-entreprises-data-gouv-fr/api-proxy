import type { NextFunction, Request, Response } from "express";
import clientUniteLegaleIG from "../clients/ig";
import { verifySiren } from "../models/siren-and-siret";

export const igController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siren = verifySiren(req.params?.siren);
    const response = await clientUniteLegaleIG(siren);
    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};
