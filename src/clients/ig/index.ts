import constants from "../../constants";
import { HttpTimeoutError } from "../../http-exceptions";
import type { Siren } from "../../models/siren-and-siret";
import { formatNameFull } from "../../utils/helpers/formatters";
import { httpGet } from "../../utils/network";
import routes from "../urls";

interface IGResponse {
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
  annee_enquete_tranche_effectif: number;
  date_cloture_effectif: string;
  date_creation_informatique: string;
  date_effet_radiation: any;
  date_immatriculation: string;
  date_mention_sans_activite: any;
  date_radiation: any;
  date_sans_activite: any;
  effectif: number;
  etat: string;
  etat_technique: string;
  id: string;
  motif_radiation: any;
  motif_sans_activite: any;
  nom: string;
  numero_identification: string;
  numero_tva_intracommunautaire: any;
  personne_morale?: PersonneMorale;
  personne_physique?: PersonnePhysique;
  sans_activite: boolean;
  tranche_effectif: {
    code: string;
    libelle: string;
  };
  type_personne: string;
}

interface PersonnePhysique {
  annee_naissance: string; // null
  autres_prenoms: string; // []
  COG_commune_naissance: string; // null
  civilite: string; // null
  email: string; // null
  jour_naissance: string; // null
  lieu_naissance: string; // null
  mois_naissance: string; // null
  nationalite: string; // null
  nom_patronymique: string; // "DUBIGNY"
  nom_usage: string; // "MENARD DUBIGNY"
  pays_naissance: string; // null
  premier_prenom: string; // "JESSICA"
  pseudonyme: string; // null
  sexe: string; // "F"
  telephone_fixe: string; // null
  telephone_professionnel: string; // null
}

interface PersonneMorale {
  associe_unique: boolean;
  assujettis_uniquement: boolean;
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
  date_cloture_exceptionnelle: string;
  date_societe_mission: string;
  denomination: string;
  divergence_beneficiaire_effectif: string[];
  economie_social_solidaire: boolean;
  forme_juridique: {
    code: string;
    libelle: string;
  };
  id: string;
  identification_registre_etranger: string;
  jour_date_cloture: number;
  mois_date_cloture: number;
  noms_domaines_internet: string[];
  numero_rna: string;
  siege_social: null;
  sigle: string;
  societe_mission: boolean;
  type_declaration_beneficiaire_effectif: string;
}

/**
 * Call IG to fetch unite legale data
 * @param siren
 * @param signal - Optional AbortSignal for request cancellation
 */
const clientUniteLegaleIG = async (siren: Siren, signal?: AbortSignal) => {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    constants.timeout.XXXL
  );

  // Combine timeout signal with optional external signal
  const combinedSignal = signal
    ? AbortSignal.any([timeoutController.signal, signal])
    : timeoutController.signal;

  try {
    const response = await httpGet<IGResponse>(routes.ig + siren, {
      signal: combinedSignal,
      headers: {
        "User-Agent": "bruno-runtime/2.1.0",
      },
    });

    return mapToDomainObject(response, siren);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error?.name === "AbortError") {
      // Check if it was a timeout or external cancellation
      if (signal?.aborted) {
        throw error; // Re-throw for external cancellation handling
      }
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
    etat: ["ACTIF", "ACTIVE"].includes(r.etat) ? "A" : "C",
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
