import constants from "../../constants";
import { HttpServerError, HttpTimeoutError } from "../../http-exceptions";
import type { Siren } from "../../models/siren-and-siret";
import { formatNameFull } from "../../utils/helpers/formatters";
import routes from "../urls";

type IGResponse = {
  id: string;
  nom: string;
  numero_identification: string;
  etat: string;
  date_immatriculation: string;
  etat_technique: string;
  type_personne: string;
  date_creation_informatique: string;
  activite_declaree: any;
  activite_naf: {
    code: string;
    libelle: string;
  };
  adresse: {
    adresse_declaree: {
      ligne1: string;
      ligne2: any;
      ligne3: any;
      code_postal: string;
      bureau_distributeur: string;
    };
    adresse_redressee: any;
    pays: {
      code: string;
      libelle: string;
    };
    coordonnees_gps: any;
    COG_commune: {
      code: string;
      libelle: string;
    };
  };
  tranche_effectif: {
    code: string;
    libelle: string;
  };
  annee_enquete_tranche_effectif: number;
  effectif: number;
  date_cloture_effectif: string;
  date_radiation: any;
  date_effet_radiation: any;
  motif_radiation: any;
  sans_activite: boolean;
  motif_sans_activite: any;
  date_sans_activite: any;
  date_mention_sans_activite: any;
  numero_tva_intracommunautaire: any;
  personne_morale?: PersonneMorale;
  personne_physique?: PersonnePhysique;
};

type PersonnePhysique = {
  nom_patronymique: string; // "DUBIGNY"
  nom_usage: string; // "MENARD DUBIGNY"
  annee_naissance: string; // null
  mois_naissance: string; // null
  jour_naissance: string; // null
  lieu_naissance: string; // null
  pays_naissance: string; // null
  premier_prenom: string; // "JESSICA"
  autres_prenoms: string; // []
  pseudonyme: string; // null
  sexe: string; // "F"
  civilite: string; // null
  nationalite: string; // null
  telephone_professionnel: string; // null
  telephone_fixe: string; // null
  email: string; // null
  COG_commune_naissance: string; // null
};

type PersonneMorale = {
  id: string;
  denomination: string;
  siege_social: null;
  au_domicile_representant_legal: boolean;
  capital: {
    montant: number;
    devise: {
      code: string;
      libelle: string;
    };
    montant_minimum: any;
    type: string;
  };
  numero_rna: string;
  type_declaration_beneficiaire_effectif: string;
  assujettis_uniquement: boolean;
  divergence_beneficiaire_effectif: string[];
  jour_date_cloture: number;
  mois_date_cloture: number;
  date_cloture_exceptionnelle: string;
  forme_juridique: {
    code: string;
    libelle: string;
  };
  sigle: string;
  associe_unique: boolean;
  identification_registre_etranger: string;
  societe_mission: boolean;
  date_societe_mission: string;
  noms_domaines_internet: string[];
  economie_social_solidaire: boolean;
};

/**
 * Call EORI to validate a French EORI number
 * @param siret
 */
const clientUniteLegaleIG = async (siren: Siren) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    constants.timeout.XXXL
  );

  try {
    const response = await fetch(routes.ig + siren, {
      signal: controller.signal,
      method: "GET",
      headers: {
        "User-Agent": "bruno-runtime/2.1.0",
      },
    });

    if (!response.ok) {
      errorMessage = `Error fetching IG data: ${response.status}: ${response.statusText}`;
      // biome-ignore lint/suspicious/noConsole: needed for logging
      console.log(errorMessage);
      if (response.status === 404) {
        thrown new HttpNotFound(errorMessage)
      }
      throw new HttpServerError(errorMessage);
    }
    const data = await response.json();
    return mapToDomainObject(data, siren);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error?.name === "AbortError") {
      throw new HttpTimeoutError("Timeout");
    }
    throw error;
  }
};

const mapToDomainObject = (r: IGResponse, siren: Siren) => {
  const isEI = r.type_personne === "PP";
  const libelleNatureJuridique = isEI
    ? "Entrepreneur individuel"
    : r?.personne_morale?.forme_juridique?.libelle;

  const nomComplet = isEI
    ? `${r?.personne_physique?.premier_prenom} ${formatNameFull(
        r?.personne_physique?.nom_patronymique,
        r?.personne_physique?.nom_usage
      )}`
    : r?.nom +
      (r?.personne_morale?.sigle ? ` (${r?.personne_morale?.sigle})` : "");

  const dateCloture =
    (r?.personne_morale?.date_cloture_exceptionnelle ??
    (r?.personne_morale?.jour_date_cloture &&
      r?.personne_morale?.mois_date_cloture))
      ? `${r?.personne_morale?.jour_date_cloture}/${
          r?.personne_morale?.mois_date_cloture
        }/${new Date().getFullYear()}`
      : "";

  return {
    siren,
    nomComplet,
    etat: r.etat === "ACTIF" ? "A" : "C",
    libelleNatureJuridique,
    activitePrincipale: r.activite_naf?.code || "",
    libelleActivitePrincipale: r.activite_naf?.libelle || "",
    dateCreation: "",
    siege: null,
    association: {
      idAssociation: r?.personne_morale?.numero_rna || null,
    },
    immatriculation: {
      dateDebutActivite: "",
      dateFin: "",
      duree: 0,
      natureEntreprise: [],
      dateCloture,
      dateImmatriculation: r.date_immatriculation || "",
      dateRadiation: r.date_radiation || "",
      isPersonneMorale: !isEI,
      capital: r?.personne_morale?.capital
        ? `${r?.personne_morale?.capital?.montant} ${r?.personne_morale?.capital?.devise?.code} ${r?.personne_morale?.capital?.type}`
        : "",
    },
  };
};

export default clientUniteLegaleIG;
