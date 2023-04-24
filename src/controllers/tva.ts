import { Request, Response, NextFunction } from 'express';
import { clientTVAVies } from '../clients/tva';

export const tvaController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slug = req.params?.slug;
    const tvaResponse = await clientTVAVies(slug);
    res.status(200).json(tvaResponse);
  } catch (e) {
    next(e);
  }
};
