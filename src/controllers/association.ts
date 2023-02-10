import { Request, Response, NextFunction } from 'express';
import { clientAssociation } from '../clients/association';

export const associationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rna = req.params?.rna;
    const association = await clientAssociation(rna);
    res.status(200).json(association);
  } catch (e) {
    next(e);
  }
};
