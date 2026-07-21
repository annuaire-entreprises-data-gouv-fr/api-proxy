import { fetchImmatriculationFromAPIRNE } from "../clients/inpi/api-rne";
import { fetchImmatriculationDateFromAPIRNE } from "../clients/inpi/api-rne/immatriculation-date";
import { fetchObservationsFromSite } from "../clients/inpi/site";
import { HttpNotFound, HttpServerError } from "../http-exceptions";
import type { Siren } from "./siren-and-siret";

export interface IEtatCivil {
  dateDemission: string | null;
  dateNaissanceFull: string;
  dateNaissancePartial: string;
  estDemissionnaire: boolean;
  nom: string;
  prenom: string;
  role: string;
}

export interface IBeneficiaire {
  dateNaissancePartial: string;
  nationalite: string;
  nom: string;
  prenoms: string;
  type: string;
}

export interface IIdentite {
  capital: string;
  dateCessationActivite: string;
  dateClotureExercice: string;
  dateDebutActiv: string;
  dateImmatriculation: string;
  dateRadiation: string;
  denomination: string;
  dureePersonneMorale: number;
  isPersonneMorale: boolean;
  libelleNatureJuridique: string;
  natureEntreprise: string;
}

export interface IPersonneMorale {
  denomination: string;
  natureJuridique: string;
  role: string;
  siren: string;
}

export interface IObservation {
  dateAjout: string;
  description: string;
  numObservation: string;
}

export type IDirigeant = IEtatCivil | IPersonneMorale;

export interface IImmatriculation {
  beneficiaires: IBeneficiaire[];
  dirigeants: IDirigeant[];
  metadata: {
    isFallback: boolean;
  };
  observations: IObservation[];
  siren: Siren;
}

/**
 * Get RNE immatriculation from API, when it works
 * @param siren
 * @param signal
 * @returns
 */
const fetchRneAPI = async (
  siren: Siren,
  signal?: AbortSignal
): Promise<IImmatriculation> => {
  try {
    const usecache = true;
    return await fetchImmatriculationFromAPIRNE(siren, usecache, signal);
  } catch (errorAPIRNE) {
    if (errorAPIRNE instanceof HttpNotFound) {
      throw errorAPIRNE;
    }
    throw new HttpServerError(`[RNE] API  failed : ${errorAPIRNE}`);
  }
};

/**
 * Get RNE immatriculation date from API
 * @param siren
 * @param signal
 * @returns The immatriculation date
 */
const fetchRneImmatriculationDate = async (
  siren: Siren,
  signal?: AbortSignal
): Promise<{ dateMiseAJourInpi: string }> => {
  try {
    return await fetchImmatriculationDateFromAPIRNE(siren, true, signal);
  } catch (errorAPIRNE) {
    if (errorAPIRNE instanceof HttpNotFound) {
      throw errorAPIRNE;
    }
    throw new HttpServerError(`[RNE] API  failed : ${errorAPIRNE}`);
  }
};

/**
 * Get INPI observations from site parser
 * @param siren
 * @param signal
 * @returns
 */
const fetchRneObservationsSite = async (
  siren: Siren,
  signal?: AbortSignal
): Promise<IObservation[]> => {
  try {
    return await fetchObservationsFromSite(siren, signal);
  } catch (fallbackError) {
    if (fallbackError instanceof HttpNotFound) {
      throw fallbackError;
    }
    throw new HttpServerError(`[RNE] Site failed : ${fallbackError}`);
  }
};

export { fetchRneAPI, fetchRneImmatriculationDate, fetchRneObservationsSite };
