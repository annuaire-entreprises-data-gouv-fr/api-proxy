import { fetchImmatriculationFromAPIRNE } from "../clients/inpi/api-rne";
import { fetchObservationsFromSite } from "../clients/inpi/site";
import { HttpNotFound, HttpServerError } from "../http-exceptions";
import type { Siren } from "./siren-and-siret";

export type IEtatCivil = {
  nom: string;
  prenom: string;
  role: string;
  dateNaissancePartial: string;
  dateNaissanceFull: string;
  estDemissionnaire: boolean;
  dateDemission: string | null;
};

export type IBeneficiaire = {
  type: string;
  nom: string;
  prenoms: string;
  dateNaissancePartial: string;
  nationalite: string;
};

export type IIdentite = {
  denomination: string;
  natureEntreprise: string;
  dateImmatriculation: string;
  dateDebutActiv: string;
  dateRadiation: string;
  dateCessationActivite: string;
  isPersonneMorale: boolean;
  dateClotureExercice: string;
  dureePersonneMorale: number;
  capital: string;
  libelleNatureJuridique: string;
};

export type IPersonneMorale = {
  siren: string;
  denomination: string;
  natureJuridique: string;
  role: string;
};

export type IObservation = {
  numObservation: string;
  dateAjout: string;
  description: string;
};

export type IDirigeant = IEtatCivil | IPersonneMorale;

export type IImmatriculation = {
  siren: Siren;
  identite: IIdentite;
  dirigeants: IDirigeant[];
  beneficiaires: IBeneficiaire[];
  observations: IObservation[];
  metadata: {
    isFallback: boolean;
  };
};

/**
 * Get RNE immatriculation from API, when it works
 * @param siren
 * @returns
 */
const fetchRneAPI = async (siren: Siren): Promise<IImmatriculation> => {
  try {
    const usecache = true;
    return await fetchImmatriculationFromAPIRNE(siren, usecache);
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
 * @returns
 */
const fetchRneObservationsSite = async (
  siren: Siren
): Promise<IObservation[]> => {
  try {
    return await fetchObservationsFromSite(siren);
  } catch (fallbackError) {
    if (fallbackError instanceof HttpNotFound) {
      throw fallbackError;
    }
    throw new HttpServerError(`[RNE] Site failed : ${fallbackError}`);
  }
};

export { fetchRneAPI, fetchRneObservationsSite };
