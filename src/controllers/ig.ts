import type { NextFunction, Request, Response } from "express";
import clientUniteLegaleIG from "../clients/ig";
import { verifySiren } from "../models/siren-and-siret";

export const igController = async (
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
    const siren = verifySiren(req.params?.siren);
    const response = await clientUniteLegaleIG(siren, abortController.signal);
    res.status(200).json(response);
  } catch (error) {
    // Don't forward abort errors to error handler since there's no client to respond to
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }
    next(error);
  }
};
