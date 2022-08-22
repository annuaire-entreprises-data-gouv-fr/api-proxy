import routes from '../urls';
import { Siren } from '../../models/siren-and-siret';
import pdfDownloader from '../../utils/download-manager';
import constants from '../../constants';
import { httpGet } from '../../utils/network';
import logErrorInSentry from '../../utils/sentry';
import { HttpTimeoutError } from '../../http-exceptions';
import getRandomInpiSiteCookieProvider from '../../utils/auth/site/provider';

interface IDownloadArgs {
  siren: Siren;
  useCookie?: boolean;
}

const downloadImmatriculationPdf = async ({
  siren,
  useCookie = true,
}: IDownloadArgs): Promise<string> => {
  let cookieProvider = null;

  try {
    const urlPdf = `${routes.rncs.portail.pdf}?format=pdf&ids=["${siren}"]`;

    let cookies = '';
    if (useCookie) {
      cookieProvider = getRandomInpiSiteCookieProvider();
      cookies = (await cookieProvider.getCookies()) || '';
    }

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
    if (e instanceof HttpTimeoutError && cookieProvider) {
      // when INPI blacklists a session it produces timeout.
      // In this case we trigger a session cookies refresh
      cookieProvider.refreshCookies();
    }

    throw e;
  }
};

export const downloadImmatriculationPdfAndSaveOnDisk = (siren: Siren) => {
  const authenticatedDownload = () =>
    downloadImmatriculationPdf({
      siren,
    });

  const downloadJobId = pdfDownloader.createJob(
    [
      // first tries using different cookies PDF
      authenticatedDownload,
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
