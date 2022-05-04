import inpiSiteAuth from '../../utils/auth/site/provider';
import { httpGet } from '../../utils/network';
import routes from '../urls';
import { Siren } from '../../models/siren-and-siret';
import constants from '../../constants';
import pdfDownloader from '../../utils/download-manager';

export const downloadImmatriculationPdf = async (
  siren: Siren
): Promise<string> => {
  try {
    const cookies = await inpiSiteAuth.getCookies();
    const response = await httpGet(
      `${routes.rncs.portail.entreprise}${siren}?format=pdf`,
      {
        headers: {
          Cookie: cookies || '',
        },
        responseType: 'arraybuffer',
        timeout: constants.pdfTimeout,
      }
    );
    const { data } = response;
    if (!data) {
      throw new Error('response is empty');
    }
    return data;
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
