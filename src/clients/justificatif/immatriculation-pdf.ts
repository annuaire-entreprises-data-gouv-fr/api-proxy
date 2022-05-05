import routes from '../urls';
import { Siren } from '../../models/siren-and-siret';
import pdfDownloader from '../../utils/download-manager';
import authSiteClient from '../../utils/auth/site';
import constants from '../../constants';

export const downloadImmatriculationPdf = async (
  siren: Siren
): Promise<string> => {
  try {
    const url = `${routes.rncs.portail.entreprise}${siren}?format=pdf`;
    return await authSiteClient(url, { timeout: constants.pdfTimeout });
  } catch (e: any) {
    throw new Error('download failed' + e);
  }
};

export const downloadImmatriculationPdfAndSaveOnDisk = (siren: Siren) => {
  const downloadJobId = pdfDownloader.createJob(() =>
    downloadImmatriculationPdf(siren)
  );
  return downloadJobId;
};

export default downloadImmatriculationPdf;
