import { verifySiren } from '../models/siren-and-siret';
import { Request, Response, NextFunction } from 'express';
import downloadImmatriculationPdf, {
  downloadImmatriculationPdfAndSaveOnDisk,
} from '../clients/justificatif/immatriculation-pdf';
import pdfDownloader from '../utils/download-manager';

export const justificatifCreateJobController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siren = verifySiren(req.params.siren);
    const slug = downloadImmatriculationPdfAndSaveOnDisk(siren);
    res.status(201).json({ slug });
  } catch (e) {
    next(e);
  }
};

export const justificatifJobStatusController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slugs = req.body as string[];

    const pdfStatuses = slugs.map((slug) => {
      const status = pdfDownloader.getDownloadStatus(slug);
      return { slug, ...status };
    });
    res.status(200).json(pdfStatuses);
  } catch (e) {
    next(e);
  }
};
