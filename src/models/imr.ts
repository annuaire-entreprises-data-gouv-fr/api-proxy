import { fetchRNCSImmatriculationFromSite } from '../clients/imr/site';
import { fetchRNCSImmatriculationFromAPI } from '../clients/imr/api';
import { Siren } from './siren-and-siret';
import { HttpNotFound, HttpServerError } from '../http-exceptions';

export interface IEtatCivil {
  sexe: 'M' | 'F' | null;
  nom: string;
  prenom: string;
  role: string;
  dateNaissance: string;
  lieuNaissance: string;
}

export interface IBeneficiaire {
  type: string;
  nom: string;
  prenoms: string;
  dateNaissance: string;
  nationalite: string;
  dateGreffe: string;
}
export interface IIdentite {
  denomination: string;
  codeGreffe: string;
  greffe: string;
  numeroRCS: string;
  numGestion: string;
  dateGreffe: string;
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

export type IDirigeant = IEtatCivil | IPersonneMorale;

export interface IImmatriculationRNCS {
  siren: Siren;
  identite: IIdentite;
  dirigeants: IDirigeant[];
  beneficiaires: IBeneficiaire[];
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
const fetchRNCSImmatriculation = async (
  siren: Siren
): Promise<IImmatriculationRNCS> => {
  try {
    return await fetchRNCSImmatriculationFromAPI(siren);
  } catch (error) {
    if (error instanceof HttpNotFound) {
      throw error;
    }
    try {
      return await fetchRNCSImmatriculationFromSite(siren);
    } catch (fallbackError) {
      if (fallbackError instanceof HttpNotFound) {
        throw fallbackError;
      }
      throw new HttpServerError(`API : ${error} | Site : ${fallbackError}`);
    }
  }
};

export {
  fetchRNCSImmatriculation,
  fetchRNCSImmatriculationFromSite,
  fetchRNCSImmatriculationFromAPI,
};
