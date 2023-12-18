import { Request, Response, NextFunction } from 'express';
import { verifyTVANumber } from '../models/siren-and-siret';
import { clientTVA } from '../clients/tva';

export const tvaController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tvaNumber = verifyTVANumber(req.params?.tvaNumber);
    const tva = await clientTVA(tvaNumber);
    res.status(200).json(tva);
  } catch (e) {
    next(e);
  }
};
