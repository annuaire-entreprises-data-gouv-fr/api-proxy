import { verifySiren } from "../models/siren-and-siret";
import { Request, Response, NextFunction } from "express";
import downloadImmatriculationPdf, {
  downloadImmatriculationPdfAndSaveOnDisk,
} from "../clients/justificatif/immatriculation-pdf";
import pdfDownloader from "../utils/download-manager";

export const justificatifController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siren = verifySiren(req.params.siren);
    const data = await downloadImmatriculationPdf(siren);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=justificatif_immatriculation_rcs_${siren}.pdf`
    );
    res.status(200).send(data);
  } catch (e) {
    next(e);
  }
};

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
    const slugs = JSON.parse(req.body) as string[];

    const pdfStatuses = slugs.map((slug) => {
      const status = pdfDownloader.getDownloadStatus(slug);
      return { slug, ...status };
    });
    res.status(200).json(pdfStatuses);
  } catch (e) {
    next(e);
  }
};
