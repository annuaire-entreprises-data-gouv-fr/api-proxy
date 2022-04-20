import {
  fetchRNCSImmatriculation,
  fetchRNCSImmatriculationFromAPI,
  fetchRNCSImmatriculationFromSite,
} from "../models/imr";
import { verifySiren } from "../models/siren-and-siret";
import { Request, Response, NextFunction } from "express";

export const statusController = async (req: Request, res: Response) => {
  try {
    const dummySiren = verifySiren("880878145");
    await Promise.all([
      fetchRNCSImmatriculationFromAPI(dummySiren),
      fetchRNCSImmatriculationFromSite(dummySiren),
      fetchRNCSImmatriculation(dummySiren),
    ]);
    res.send({ test: true, status: 200 });
  } catch (e: any) {
    res.send({ test: false, status: e.status | 500 });
  }
};
