import { Request, Response, NextFunction } from 'express';
import { verifySiren } from '../models/siren-and-siret';
import clientUniteLegaleIG from '../clients/ig';

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
