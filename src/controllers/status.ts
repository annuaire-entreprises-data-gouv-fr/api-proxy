import { Request, Response } from 'express';
import { fetchRneAPI } from '../models/rne';
import { verifySiren } from '../models/siren-and-siret';

export const apiRneStatusController = async (req: Request, res: Response) => {
  try {
    const dummySiren = verifySiren('552032534');

    await fetchRneAPI(dummySiren);
    res.send({ message: 'ok', status: 200 });
  } catch (e: any) {
    const status = e.status || 500;
    res.status(status).send({ message: 'ko', status });
  }
};
