import { Request, Response, NextFunction } from "express";
import { HttpError, isHttpError } from "../htttp-exceptions";

export const errorHandler = function (
  err: Error | HttpError,
  req: Request,
  res: Response,
  next: () => void
) {
  if (isHttpError(err)) {
    res
      .status(err.status)
      .json({ message: err.message || "Une erreur est survenue" });
  } else {
    res.status(500).json({ message: err.message || "Une erreur est survenue" });
  }
};
