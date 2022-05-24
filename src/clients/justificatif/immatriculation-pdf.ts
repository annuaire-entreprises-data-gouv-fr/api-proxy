import routes from '../urls';
import { Siren } from '../../models/siren-and-siret';
import pdfDownloader from '../../utils/download-manager';
import authenticatedSiteClient from '../../utils/auth/site';
import constants from '../../constants';
import { httpGet } from '../../utils/network';
import { logWarningInSentry } from '../../utils/sentry';

const RETRY_COUNT = 3;

export const downloadImmatriculationPdf = async (
  siren: Siren,
  authenticated = false
): Promise<string> => {
  try {
    const urlPdf = `${routes.rncs.portail.entreprise}${siren}?format=pdf`;
    if (authenticated) {
      return await authenticatedSiteClient(urlPdf, {
        timeout: constants.pdfTimeout,
      });
    }
    const response = await httpGet(urlPdf, {
      timeout: constants.pdfTimeout,
    });
    return response.data;
  } catch (e: any) {
    throw new Error('PDF download failed: ' + e);
  }
};

export const downloadImmatriculationPdfAndSaveOnDisk = (siren: Siren) => {
  const downloadJobId = pdfDownloader.createJob(
    RETRY_COUNT,
    () => downloadImmatriculationPdf(siren, true),
    () => downloadImmatriculationPdf(siren, false),
    (error: any) => {
      logWarningInSentry('Download manager : all retries failed', {
        details: error,
        siren,
      });
    }
  );
  return downloadJobId;
};

export default downloadImmatriculationPdf;
