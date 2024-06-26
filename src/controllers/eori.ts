import { Request, Response, NextFunction } from 'express';
import { verifySiret } from '../models/siren-and-siret';
import clientEORI from '../clients/eori';

export const eoriController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siret = verifySiret(req.params?.siret);
    const eoriValidation = await clientEORI(siret);
    res.status(200).json(eoriValidation);
  } catch (e) {
    next(e);
  }
};
