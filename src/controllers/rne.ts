import type { NextFunction, Request, Response } from "express";
import { fetchRneAPI, fetchRneObservationsSite } from "../models/rne";
import { verifySiren } from "../models/siren-and-siret";

export const rneControllerAPI = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siren = verifySiren(req.params.siren);
    const rne = await fetchRneAPI(siren);
    res.status(200).json(rne);
  } catch (e) {
    next(e);
  }
};

export const rneControllerObservationsSite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siren = verifySiren(req.params.siren);
    const observations = await fetchRneObservationsSite(siren);
    res.status(206).json(observations);
  } catch (e) {
    next(e);
  }
};
