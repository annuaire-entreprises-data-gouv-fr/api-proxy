import { HttpNotFound } from '../../../http-exceptions';
import { IImmatriculation } from '../../../models/imr';
import { Siren } from '../../../models/siren-and-siret';
import { authApiRneClient } from '../../../utils/auth/api-rne';
import routes from '../../urls';

interface IRNEPersonne {
  descriptionPersonne: {
    dateDeNaissance: string;
    nom: string;
    prenoms: string[];
    nomUsage: string;
    nationalite: string;
  };
  entreprise?: {};
  adresseEntreprise?: {
    pays: string;
    codePostal: string;
    commune: string;
    codeInseeCommune: string;
    voie: string;
  };
  representant?: {
    descriptionPersonne: {};
    adresseDomicile: {};
  };
}

interface IRNEResponse {
  createdAt: string;
  updatedAt: string;
  id: string;
  formality: {
    siren: string;
    content: {
      natureCreation: {
        dateCreation: string;
        formeJuridique: string;
        relieeEntrepriseAgricole: boolean;
      };
      personneMorale?: {
        identite: {
          entreprise: {
            siren: string;
            denomination: string;
            formeJuridique: string;
            codeApe: string;
            dateImmat: string;
          };
          description: {
            duree: number;
            ess: boolean;
            capitalVariable: boolean;
            montantCapital: number;
            deviseCapital: string;
          };
          nomsDeDomaine: [];
          entreprisesIntervenant: [];
        };
        adresseEntreprise: {
          caracteristiques: {
            ambulant: boolean;
          };
          entrepriseDomiciliataire: {};
        };
        composition: {
          pouvoirs: IRNEPersonne[];
        };
        etablissementPrincipal: any;
        autresEtablissements: any[];
        detailCessationEntreprise: {
          repreneurs: [];
        };
        beneficiairesEffectifs: [];
        observations: {
          rcs: [];
        };
      };
      personnePhysique?: any;
    };
  };
  siren: string;
}

export const fetchImmatriculationFromAPIRNE = async (siren: Siren) => {
  const response = await authApiRneClient(routes.api.rne.cmc.companies + siren);
  const data = response.data as IRNEResponse[];

  if (data.length === 0) {
    throw new HttpNotFound(siren);
  } else {
    if (data[0].formality.content.personnePhysique) {
      return mapPersonnePhysiqueToDomainObject(data[0], siren);
    }
    if (data[0].formality.content.personneMorale) {
      return mapPersonneMoraleToDomainObject(data[0], siren);
    }
    throw new Error('Error in API RNE no personne morale or physique');
  }
};

const mapPersonneMoraleToDomainObject = (
  xmlResponse: IRNEResponse,
  siren: Siren
): IImmatriculation => {
  return {
    siren,
    dirigeants: [],
    beneficiaires: [],
    identite: {},
    metadata: {
      isFallback: false,
    },
  };
};

const mapPersonnePhysiqueToDomainObject = (
  xmlResponse: IRNEResponse,
  siren: Siren
): IImmatriculation => {
  return {
    siren,
    dirigeants: [],
    beneficiaires: [],
    identite: {},
    metadata: {
      isFallback: false,
    },
  };
};
