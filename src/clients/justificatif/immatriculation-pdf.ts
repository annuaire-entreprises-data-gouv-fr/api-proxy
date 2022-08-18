import routes from '../urls';
import { Siren } from '../../models/siren-and-siret';
import pdfDownloader from '../../utils/download-manager';
import constants from '../../constants';
import { httpGet } from '../../utils/network';
import { logWarningInSentry } from '../../utils/sentry';
import inpiSiteAuth from '../../utils/auth/site/provider';

const RETRY_COUNT = 3;

interface IDownloadArgs {
  siren: Siren;
  authenticated: boolean;
}

const downloadImmatriculationPdf = async ({
  siren,
  authenticated = false,
}: IDownloadArgs): Promise<string> => {
  try {
    const urlPdf = `${routes.rncs.portail.pdf}?format=pdf&ids=["${siren}"]`;

    let cookies = '';
    if (authenticated) {
      cookies = (await inpiSiteAuth.getCookies()) || '';
    }

    console.log(cookies);

    const response = await httpGet(urlPdf, {
      headers: {
        Cookie: cookies,
        Accept: '*/*',
        Host: 'data.inpi.fr',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0',
      },
      timeout: constants.pdfTimeout,
      responseType: 'arraybuffer',
    });
    const { data } = response;
    if (!data) {
      throw new Error('response is empty');
    }
    return data;
  } catch (e: any) {
    throw new Error('PDF download failed: ' + e);
  }
};

export const downloadImmatriculationPdfAndSaveOnDisk = (siren: Siren) => {
  const downloadJobId = pdfDownloader.createJob(
    RETRY_COUNT,
    // first retries on authenticated PDF
    () => downloadImmatriculationPdf({ siren, authenticated: true }),
    // fallback retry on public PDF
    () => downloadImmatriculationPdf({ siren, authenticated: false }),
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
