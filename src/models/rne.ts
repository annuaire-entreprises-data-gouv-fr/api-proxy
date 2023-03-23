import { Siren } from './siren-and-siret';
import { HttpNotFound, HttpServerError } from '../http-exceptions';
import { fetchImmatriculationFromSite } from '../clients/inpi/site';
import { fetchImmatriculationFromAPIRNE } from '../clients/inpi/api-rne';
import { IImmatriculation } from './imr';

/**
 * This is the method to call in order to get RNCS immatriculation
 * First call on API IMR and fallback on INPI site parser
 * @param siren
 * @returns
 */
const fetchRne = async (siren: Siren): Promise<IImmatriculation> => {
  try {
    return await fetchImmatriculationFromAPIRNE(siren);
  } catch (errorAPIRNE) {
    if (errorAPIRNE instanceof HttpNotFound) {
      throw errorAPIRNE;
    }

    try {
      return {
        ...(await fetchImmatriculationFromSite(siren)),
        metadata: {
          isFallback: true,
        },
      };
    } catch (fallbackError) {
      if (fallbackError instanceof HttpNotFound) {
        throw fallbackError;
      }
      throw new HttpServerError(`API RNE and Site fallback failed`);
    }
  }
};

export { fetchRne, fetchImmatriculationFromSite };
