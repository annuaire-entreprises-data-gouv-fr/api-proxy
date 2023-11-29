import {
  downloadActeRne,
  downloadBilanRne,
} from '../clients/inpi/api-rne-download';
import { Request, Response, NextFunction } from 'express';

export const rneActeDownloadController = async (
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

export const rneBilanDownloadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const pdf = await downloadBilanRne(id);
    res.type('pdf');
    res.status(200);
    res.setHeader('content-type', 'application/pdf');
    res.end(Buffer.from(pdf.data, 'binary'));
  } catch (e) {
    next(e);
  }
};
