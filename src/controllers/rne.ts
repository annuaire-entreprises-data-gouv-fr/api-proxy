import { verifySiren } from '../models/siren-and-siret';
import { Request, Response, NextFunction } from 'express';
import { fetchRneAPI, fetchRneSite } from '../models/rne';

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

export const rneControllerSite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siren = verifySiren(req.params.siren);
    const rne = await fetchRneSite(siren);
    res.status(206).json(rne);
  } catch (e) {
    next(e);
  }
};
