import { Request, Response } from 'express';
import { listDocumentsRne } from '../clients/inpi/api-rne/documents';
import { verifySiren } from '../models/siren-and-siret';

export const apiRneStatusController = async (req: Request, res: Response) => {
  try {
    const dummySiren = verifySiren('552032534');

    // uses actes for monitoring as they are rarely rate limited
    await listDocumentsRne(dummySiren);
    res.send({ message: 'ok', status: 200 });
  } catch (e: any) {
    const status = e.status || 500;
    res.status(status).send({ message: 'ko', status });
  }
};
