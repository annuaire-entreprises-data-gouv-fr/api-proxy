import type { NextFunction, Request, Response } from "express";
import { clientTVA } from "../clients/tva";
import { verifyTVANumber } from "../models/siren-and-siret";

export const tvaController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const abortController = new AbortController();

  // Cancel the request if client disconnects
  req.on("close", () => {
    abortController.abort();
  });

  try {
    const useCache = req.query?.useCache !== "false";
    const tvaNumber = verifyTVANumber(req.params?.tvaNumber);
    const tva = await clientTVA(tvaNumber, useCache, abortController.signal);
    res.status(200).json(tva);
  } catch (error) {
    // Don't forward abort errors to error handler since there's no client to respond to
    if (error instanceof Error && error.name === "CanceledError") {
      return;
    }
    next(error);
  }
};
