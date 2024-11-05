import routes from '../urls';
import { Siren } from '../../models/siren-and-siret';
import pdfDownloader from '../../utils/download-manager';
import constants from '../../constants';
import { httpGet } from '../../utils/network';
import logErrorInSentry, { logWarningInSentry } from '../../utils/sentry';
import inpiSiteCookies from '../../utils/auth/site/provider';

interface IDownloadArgs {
  siren: Siren;
  useCookie?: boolean;
}

const downloadImmatriculationPdf = async ({
  siren,
  useCookie = true,
}: IDownloadArgs): Promise<string> => {
  const urlPdf = `${routes.inpi.portail.pdf}?format=pdf&ids=["${siren}"]`;

  let cookies = '';
  if (useCookie) {
    cookies = await inpiSiteCookies.getCookies();
  }

  const response = await httpGet<string>(urlPdf, {
    headers: {
      Cookie: cookies,
      Accept: '*/*',
      Host: 'data.inpi.fr',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0',
    },
    useCache: false,
    timeout: constants.timeout.XXXL,
    responseType: 'arraybuffer',
  });
  if (!response) {
    throw new Error('response is empty');
  }

  if (!useCookie) {
    logWarningInSentry('Download manager : download fallbacked on public PDF');
  }
  return response;
};

export const downloadImmatriculationPdfAndSaveOnDisk = (siren: Siren) => {
  logWarningInSentry('Download manager : download initiated');

  const authenticatedDownload = () =>
    downloadImmatriculationPdf({
      siren,
    });

  const downloadJobId = pdfDownloader.createJob(
    [
      // first tries using different cookies PDF
      authenticatedDownload,
      authenticatedDownload,
      // fallback retry on public PDF
      () => downloadImmatriculationPdf({ siren, useCookie: false }),
    ],
    (error: any) => {
      logErrorInSentry('Download manager : all retries failed', {
        details: error.toString(),
        siren,
      });
    }
  );
  return downloadJobId;
};

export default downloadImmatriculationPdf;
