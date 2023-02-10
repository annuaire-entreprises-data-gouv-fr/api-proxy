import { verifySiren } from '../models/siren-and-siret';
import { Request, Response, NextFunction } from 'express';
import { fetchImmatriculation } from '../models/imr';
import { fetchRne } from '../models/rne';

export const imrController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siren = verifySiren(req.params.siren);
    const imr = await fetchImmatriculation(siren);

    // return partial content 206 when using site fallback
    const status = imr?.metadata?.isFallback ? 206 : 200;

    res.status(status).json(imr);
  } catch (e) {
    next(e);
  }
};

export const rneController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siren = verifySiren(req.params.siren);
    const rne = await fetchRne(siren);

    // return partial content 206 when using site fallback
    const status = rne?.metadata?.isFallback ? 206 : 200;

    res.status(status).json(rne);
  } catch (e) {
    next(e);
  }
};
