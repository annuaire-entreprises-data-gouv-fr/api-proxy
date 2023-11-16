import { listActesRne } from '../clients/inpi/api-rne-actes';
import { downloadActeRne } from '../clients/inpi/api-rne-actes/download';
import { verifySiren } from '../models/siren-and-siret';
import { Request, Response, NextFunction } from 'express';

export const rneListActesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siren = verifySiren(req.params.siren);
    const actes = await listActesRne(siren);
    res.status(200).json(actes);
  } catch (e) {
    next(e);
  }
};

export const rneActesDownloadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const pdf = await downloadActeRne(id);
    res.type('pdf');
    res.status(200);
    res.setHeader('content-type', 'application/pdf');
    res.end(Buffer.from(pdf.data, 'binary'));
  } catch (e) {
    next(e);
  }
};
