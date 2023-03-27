import { Siren } from './siren-and-siret';
import { HttpNotFound, HttpServerError } from '../http-exceptions';
import { fetchImmatriculationFromAPIRNCS } from '../clients/inpi/api-rncs';
import { fetchImmatriculationFromSite } from '../clients/inpi/site';
import { logWarningInSentry } from '../utils/sentry';

export interface IEtatCivil {
  nom: string;
  prenom: string;
  role: string;
  dateNaissancePartial: string;
  dateNaissanceFull: string;
  // sexe: string;
  // lieuNaissance: string;
}

export interface IBeneficiaire {
  type: string;
  nom: string;
  prenoms: string;
  dateNaissancePartial: string;
  nationalite: string;
  // dateGreffe: string;
}

export interface IIdentite {
  // codeGreffe: string;
  // greffe: string;
  // numeroRCS: string;
  // numGestion: string;
  // dateGreffe: string;

  denomination: string;
  natureEntreprise: string;
  dateImmatriculation: string;
  dateDebutActiv: string;
  dateRadiation: string;
  dateCessationActivite: string;
  isPersonneMorale: boolean;
  dateClotureExercice: string;
  dureePersonneMorale: string;
  capital: string;
  libelleNatureJuridique: string;
}

export interface IPersonneMorale {
  siren: string;
  denomination: string;
  natureJuridique: string;
  role: string;
}

export interface IObservation {
  numObservation: string;
  dateAjout: string;
  description: string;
}

export type IDirigeant = IEtatCivil | IPersonneMorale;

export interface IImmatriculation {
  siren: Siren;
  identite: IIdentite;
  dirigeants: IDirigeant[];
  beneficiaires: IBeneficiaire[];
  observations: IObservation[];
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
const fetchImmatriculation = async (
  siren: Siren
): Promise<IImmatriculation> => {
  try {
    return await fetchImmatriculationFromAPIRNCS(siren);
  } catch (errorAPIRNCS) {
    if (errorAPIRNCS instanceof HttpNotFound) {
      throw errorAPIRNCS;
    }
    try {
      return await fetchImmatriculationFromSite(siren);
    } catch (fallbackError) {
      if (fallbackError instanceof HttpNotFound) {
        throw fallbackError;
      }
      throw new HttpServerError(`API RNCS and Site fallback failed`);
    }
  }
};

/**
 * Log warning in sentry if siren is in RNCS
 * @param siren
 */
const isInRNCSCheck = async (siren: Siren): Promise<void> => {
  try {
    await fetchImmatriculationFromAPIRNCS(siren);
    logWarningInSentry('Should not be found RNCS', { siren });
    // eslint-disable-next-line no-empty
  } catch {}
};

export {
  fetchImmatriculation,
  fetchImmatriculationFromSite,
  fetchImmatriculationFromAPIRNCS,
  isInRNCSCheck,
};
