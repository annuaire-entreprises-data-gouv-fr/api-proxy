import { Request, Response, NextFunction } from 'express';
import { clientTVAVies } from '../clients/tva';
import { HttpConnectionReset } from '../http-exceptions';
import { logWarningInSentry } from '../utils/sentry';

export const tvaController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slug = req.params?.slug;
    try {
      const tvaResponse = await clientTVAVies(slug);
      res.status(200).json(tvaResponse);
    } catch (firstTryError) {
      if (firstTryError instanceof HttpConnectionReset) {
        logWarningInSentry('ECONNRESET in API TVA : retrying');
        const tvaResponse = await clientTVAVies(slug);
        res.status(200).json(tvaResponse);
      } else {
        throw firstTryError;
      }
    }
  } catch (e) {
    next(e);
  }
};
