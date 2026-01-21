import type { NextFunction, Request, Response } from "express";
import { fetchRneAPI, fetchRneObservationsSite } from "../models/rne";
import { verifySiren } from "../models/siren-and-siret";

export const rneControllerAPI = async (
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
    const siren = verifySiren(req.params.siren);
    const rne = await fetchRneAPI(siren, abortController.signal);
    res.status(200).json(rne);
  } catch (error) {
    // Don't forward abort errors to error handler since there's no client to respond to
    if (error instanceof Error && error.name === "CanceledError") {
      return;
    }
    next(error);
  }
};

export const rneControllerObservationsSite = async (
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
    const siren = verifySiren(req.params.siren);
    const observations = await fetchRneObservationsSite(
      siren,
      abortController.signal
    );
    res.status(206).json(observations);
  } catch (error) {
    // Don't forward abort errors to error handler since there's no client to respond to
    if (error instanceof Error && error.name === "CanceledError") {
      return;
    }
    next(error);
  }
};
