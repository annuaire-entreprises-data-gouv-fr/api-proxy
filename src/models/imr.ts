import { Siren } from './siren-and-siret';
import { HttpNotFound, HttpServerError } from '../http-exceptions';
import { fetchImmatriculationFromAPIRNCS } from '../clients/inpi/api-rncs';
import { fetchImmatriculationFromSite } from '../clients/inpi/site';

export interface IEtatCivil {
  nom: string;
  prenom: string;
  role: string;
  dateNaissancePartial: string;
  // sexe: string;
  // dateNaissanceFull: string;
  // lieuNaissance: string;
}

export interface IBeneficiaire {
  type: string;
  nom: string;
  prenoms: string;
  dateNaissancePartial: string;
  // nationalite: string;
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
  test: string;
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
      throw new HttpServerError(
        `API RNCS : ${errorAPIRNCS} | Site fallback failed`
      );
    }
  }
};

export {
  fetchImmatriculation,
  fetchImmatriculationFromSite,
  fetchImmatriculationFromAPIRNCS,
};
