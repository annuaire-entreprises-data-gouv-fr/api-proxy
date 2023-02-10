import {
  fetchImmatriculationFromAPIRNCS,
  fetchImmatriculationFromSite,
} from '../models/imr';
import { verifySiren } from '../models/siren-and-siret';
import { Request, Response } from 'express';
import { fetchImmatriculationFromAPIRNE } from '../clients/inpi/api-rne';

export const apiImrStatusController = async (req: Request, res: Response) => {
  try {
    const dummySiren = verifySiren('552032534');
    await fetchImmatriculationFromAPIRNCS(dummySiren);
    res.send({ message: 'ok', status: 200 });
  } catch (e: any) {
    const status = e.status || 500;
    res.status(status).send({ message: 'ko', status });
  }
};

export const siteImrStatusController = async (req: Request, res: Response) => {
  try {
    const dummySiren = verifySiren('552032534');
    await fetchImmatriculationFromSite(dummySiren);
    res.send({ message: 'ok', status: 200 });
  } catch (e: any) {
    const status = e.status || 500;
    res.status(status).send({ message: 'ko', status });
  }
};

export const apiRneStatusController = async (req: Request, res: Response) => {
  try {
    const dummySiren = verifySiren('552032534');
    await fetchImmatriculationFromAPIRNE(dummySiren);
    res.send({ message: 'ok', status: 200 });
  } catch (e: any) {
    const status = e.status || 500;
    res.status(status).send({ message: 'ko', status });
  }
};
