import { Siren } from './siren-and-siret';
import { HttpNotFound, HttpServerError } from '../http-exceptions';
import { fetchImmatriculationFromSite } from '../clients/inpi/site';
import { fetchImmatriculationFromAPIRNE } from '../clients/inpi/api-rne';

interface IActe {
  id: string;
  dateDepot: string;
  detailsDocuments: {
    nom: string;
    label: string;
  }[];
}

interface IBilan {
  id: string;
  dateDepot: string;
  typeBilan: string;
  dateCloture: string;
  confidentiality: string;
}

export interface IDocuments {
  actes: IActe[];
  bilans: IBilan[];
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
  dureePersonneMorale: number;
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
 * Get RNE immatriculation from API, when it works
 * @param siren
 * @returns
 */
const fetchRneAPI = async (siren: Siren): Promise<IImmatriculation> => {
  try {
    return await fetchImmatriculationFromAPIRNE(siren);
  } catch (errorAPIRNE) {
    if (errorAPIRNE instanceof HttpNotFound) {
      throw errorAPIRNE;
    }
    throw new HttpServerError(`[RNE] API  failed : ${errorAPIRNE}`);
  }
};

/**
 * Get INPI immatriculation from site parser
 * @param siren
 * @returns
 */
const fetchRneSite = async (siren: Siren): Promise<IImmatriculation> => {
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
    throw new HttpServerError(`[RNE] Site failed : ${fallbackError}`);
  }
};

export { fetchRneAPI, fetchRneSite };
