import { Siren } from './siren-and-siret';
import { HttpNotFound, HttpServerError } from '../http-exceptions';
import { fetchImmatriculationFromSite } from '../clients/inpi/site';
import { fetchImmatriculationFromAPIRNE } from '../clients/inpi/api-rne';

export interface IIdentiteRne {
  denomination: string;
  dateImmatriculation: string;
  dateDebutActiv: string;
  dateRadiation: string;
  dateCessationActivite: string;
  isPersonneMorale: boolean;
  dateClotureExercice: string;
  dureePersonneMorale: string;
  capital: string;
  codeNatureJuridique: string;
}

export interface IImmatriculationRne {
  siren: Siren;
  identite?: IIdentiteRne;
  metadata: {
    isFallback: boolean;
  };
}

/**
 * This is the method to call in order to get RNCS immatriculation
 * First call on API IMR and fallback on INPI site parser
 * @param siren
 * @returns
 */
const fetchRne = async (siren: Siren): Promise<IImmatriculationRne> => {
  try {
    return await fetchImmatriculationFromAPIRNE(siren);
  } catch (errorAPIRNE) {
    if (errorAPIRNE instanceof HttpNotFound) {
      throw errorAPIRNE;
    }

    try {
      const testIfPageExist = await fetchImmatriculationFromSite(siren);
      if (testIfPageExist) {
        return {
          siren,
          identite: undefined,
          metadata: {
            isFallback: true,
          },
        };
      }
      throw new HttpNotFound(siren);
    } catch (fallbackError) {
      if (fallbackError instanceof HttpNotFound) {
        throw fallbackError;
      }
      throw new HttpServerError(
        `API RNE: ${errorAPIRNE} | Site fallback failed`
      );
    }
  }
};

export { fetchRne, fetchImmatriculationFromSite };
