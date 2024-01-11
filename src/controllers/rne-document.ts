import { listDocumentsRne } from '../clients/inpi/api-rne-documents';
import { verifySiren } from '../models/siren-and-siret';
import { Request, Response, NextFunction } from 'express';

export const rneListDocumentsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siren = verifySiren(req.params.siren);
    const documents = await listDocumentsRne(siren);
    res.status(200).json(documents);
  } catch (e) {
    next(e);
  }
};
