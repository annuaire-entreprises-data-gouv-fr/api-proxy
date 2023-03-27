interface IRNEIdentitePM {
  entreprise: {
    siren: string;
    denomination: string;
    formeJuridique: string;
    codeApe: string;
    dateImmat: string;
    nomCommercial: string;
    sigle: string;
    dateRad: string;
    dateDebutActiv: string;
  };
  description: {
    duree: number;
    ess: boolean;
    capitalVariable: boolean;
    montantCapital: number;
    deviseCapital: string;
    dateClotureExerciceSocial: string;
  };
  nomsDeDomaine: [];
  entreprisesIntervenant: [];
}
interface IRNEIdentitePP {
  entrepreneur: IRNEEntrepreneur;
  entreprise: {
    siren: string;
    formeJuridique: string;
    codeApe: string;
    dateImmat: string;
    dateRad: string;
    dateDebutActiv: string;
  };
}

interface IRNEEntrepreneur {
  descriptionPersonne: {
    nom: string;
    prenoms: string[];
    nomUsage: string;
  };
}

interface IRNEAdresse {
  caracteristiques: {
    ambulant: boolean;
    domiciliataire: string | null;
  };
  adresse: {
    roleAdresse: string | null;
    pays: string | null;
    codePays: 'FRA';
    codePostal: string | null;
    commune: string | null;
    codeInseeCommune: string | null;
    caracteristiques: string | null;
  };
  entrepriseDomiciliataire: string | null;
}

export interface IRNEResponse {
  siren: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  formality: {
    siren: string;
    evenementCessation: string | null;
    natureCessation: string | null;
    succursaleOuFiliale: 'AVEC_ETABLISSEMENT';
    indicateurPoursuiteCessation: string | null;
    content: {
      formeExerciceActivitePrincipale: string;
      natureCreation: {
        dateCreation: string | null;
        societeEtrangere: boolean;
        formeJuridique: string | null;
        typeExploitation: string | null;
        microEntreprise: boolean;
        etablieEnFrance: boolean;
        salarieEnFrance: boolean;
        relieeEntrepriseAgricole: boolean;
        entrepriseAgricole: boolean;
        eirl: boolean;
      };
      personneMorale?: {
        identite: IRNEIdentitePM;
        adresseEntreprise: IRNEAdresse;
        detailCessationEntreprise: any;
        beneficiairesEffectifs: any[];
        observations: { rcs: any[] };
        composition: {
          pouvoirs: any[];
        };
      };
      personnePhysique?: {
        identite: IRNEIdentitePP;
        adresseEntreprise: IRNEAdresse;
        detailCessationEntreprise: any;
        composition: {
          pouvoirs: any[];
        };
      };
    };
  };
}
