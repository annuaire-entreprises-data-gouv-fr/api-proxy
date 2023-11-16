import { Siren } from './siren-and-siret';
import { HttpNotFound, HttpServerError } from '../http-exceptions';
import { fetchImmatriculationFromSite } from '../clients/inpi/site';
import { fetchImmatriculationFromAPIRNE } from '../clients/inpi/api-rne';

interface IActe {
  id: string;
  dateDepot: string;
}

export interface IActes {
  actes: IActe[];
  bilans: IActe[];
  bilansSaisis: IActe[];
}

export interface IEtatCivil {
  nom: string;
  prenom: string;
  role: string;
  dateNaissancePartial: string;
  dateNaissanceFull: string;
}

export interface IBeneficiaire {
  type: string;
  nom: string;
  prenoms: string;
  dateNaissancePartial: string;
  nationalite: string;
}

export interface IIdentite {
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
 * This is the method to call in order to get RNE immatriculation
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
      throw new HttpServerError(
        `API RNE and Site failed : ${errorAPIRNE} | ${fallbackError}`
      );
    }
  }
};

export { fetchRne, fetchImmatriculationFromSite };
