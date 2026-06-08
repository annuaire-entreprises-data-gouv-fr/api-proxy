interface IRNEIdentitePM {
  description: {
    duree: number;
    ess: boolean;
    capitalVariable: boolean;
    montantCapital: number;
    deviseCapital: string;
    dateClotureExerciceSocial: string;
  };
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
  entreprisesIntervenant: [];
  nomsDeDomaine: [];
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
    dateDeNaissance: string;
  };
}

interface IRNEAdresse {
  adresse: {
    roleAdresse: string | null;
    pays: string | null;
    codePays: "FRA";
    codePostal: string | null;
    commune: string | null;
    codeInseeCommune: string | null;
    caracteristiques: string | null;
  };
  caracteristiques: {
    ambulant: boolean;
    domiciliataire: string | null;
  };
  entrepriseDomiciliataire: string | null;
}

interface IRNEPouvoir {
  adresseEntreprise?: IRNEAdresse;
  dateMentionDemissionOrdre?: string;
  entreprise?: {
    roleEntreprise: string; //'71',
    siren: string; // '387953961',
    denomination: string; // 'Mazars et Associés',
    formeJuridique: string; //'Société par actions simplifiée',
    entrepriseValidated: boolean;
    entrepriseRdd: true;
  };
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
  libelleRoleEntreprise: string; // 'Commissaire aux comptes titulaire',
  mentionDemissionOrdre: boolean;
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
  roleEntreprise: string; // '65',
  typeDePersonne: string; //'ENTREPRISE',
}

export interface IRNEPersonneMorale {
  adresseEntreprise: IRNEAdresse;
  beneficiairesEffectifs: any[];
  composition: {
    pouvoirs: IRNEPouvoir[];
  };
  detailCessationEntreprise: {
    dateRadiation: string;
    dateEffet: string;
    dateCessationTotaleActivite: string;
  };
  identite: IRNEIdentitePM;
  observations: { rcs: any[] };
}

export interface IRNEPersonnePhysique {
  adresseEntreprise: IRNEAdresse;
  composition: {
    pouvoirs: IRNEPouvoir[];
  };
  detailCessationEntreprise: any;
  identite: IRNEIdentitePP;
}

export interface IRNEResponse {
  createdAt: string;
  formality: {
    siren: string;
    evenementCessation: string | null;
    natureCessation: string | null;
    succursaleOuFiliale: "AVEC_ETABLISSEMENT";
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
  id: string;
  siren: string;
  updatedAt: string;
}

export interface IRNEInscriptionsOffices {
  dateEffet: string;
  observationComplementaire: string;
  partnerCenter: string;
  partnerCode: string;
}
