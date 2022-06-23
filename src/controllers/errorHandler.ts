import { Request, Response } from 'express';
import { HttpError, isHttpError } from '../http-exceptions';

export const errorHandler = function (
  err: Error | HttpError,
  _req: Request,
  res: Response,
  _next: () => void
) {
  if (isHttpError(err)) {
    res
      .status(err.status)
      .json({ message: err.message || 'Une erreur est survenue' });
  } else {
    res.status(500).json({ message: err.message || 'Une erreur est survenue' });
  }
};
