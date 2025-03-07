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

interface IRNEPouvoir {
  libelleRoleEntreprise: string; // 'Commissaire aux comptes titulaire',
  typeDePersonne: string; //'ENTREPRISE',
  indicateurActifAgricole: boolean;
  individu: {
    descriptionPersonne: {
      sirenPresent: boolean;
      dateEffetRoleDeclarantPresent: boolean;
      genrePresent: boolean;
      titrePresent: boolean;
      dateDeNaissance: string; //'1961-08';
      dateDeNaissancePresent: boolean;
      paysNaissancePresent: boolean;
      lieuDeNaissancePresent: boolean;
      codePostalNaissancePresent: boolean;
      codeInseeGeographiquePresent: boolean;
      situationMatrimonialePresent: boolean;
      qualiteDeNonSedentaritePresent: boolean;
      indicateurDeNonSedentaritePresent: boolean;
      role: string; //'65';
      nom: string; //'Kingo';
      prenoms: string[];
      nomUsage: string;
      nationalite: string; //'Danoise';
      codeNationalite: string; //'DNK';
      situationMatrimoniale: string; // '1';
    };
    adresseDomicile: IRNEAdresse;
  };
  entreprise?: {
    roleEntreprise: string; //'71',
    siren: string; // '387953961',
    denomination: string; // 'Mazars et Associés',
    formeJuridique: string; //'Société par actions simplifiée',
    entrepriseValidated: boolean;
    entrepriseRdd: true;
  };
  adresseEntreprise?: IRNEAdresse;
  representant?: {
    descriptionPersonne: {
      sirenPresent: boolean;
      dateEffetRoleDeclarantPresent: boolean;
      genrePresent: boolean;
      titrePresent: boolean;
      dateDeNaissancePresent: boolean;
      paysNaissancePresent: boolean;
      lieuDeNaissancePresent: boolean;
      codePostalNaissancePresent: boolean;
      codeInseeGeographiquePresent: boolean;
      situationMatrimonialePresent: boolean;
      qualiteDeNonSedentaritePresent: boolean;
      indicateurDeNonSedentaritePresent: boolean;
    };
    adresseDomicile: IRNEAdresse;
    indicateurActifAgricole: boolean;
  };
}

export interface IRNEPersonneMorale {
  identite: IRNEIdentitePM;
  adresseEntreprise: IRNEAdresse;
  detailCessationEntreprise: {
    dateRadiation: string;
    dateEffet: string;
    dateCessationTotaleActivite: string;
  };
  beneficiairesEffectifs: any[];
  observations: { rcs: any[] };
  composition: {
    pouvoirs: IRNEPouvoir[];
  };
}

export interface IRNEPersonnePhysique {
  identite: IRNEIdentitePP;
  adresseEntreprise: IRNEAdresse;
  detailCessationEntreprise: any;
  composition: {
    pouvoirs: IRNEPouvoir[];
  };
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
      inscriptionsOffices: [];
      personneMorale?: IRNEPersonneMorale;
      exploitation?: IRNEPersonneMorale;
      personnePhysique?: IRNEPersonnePhysique;
    };
  };
}

export type IRNEInscriptionsOffices = {
  dateEffet: string;
  partnerCenter: string;
  partnerCode: string;
  observationComplementaire: string;
};
