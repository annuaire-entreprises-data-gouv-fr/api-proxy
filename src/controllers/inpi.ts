import { verifySiren } from '../models/siren-and-siret';
import { Request, Response, NextFunction } from 'express';
import { fetchRne } from '../models/rne';

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
