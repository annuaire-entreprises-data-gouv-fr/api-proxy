import constants from "../../../constants";
import { HttpNotFound } from "../../../http-exceptions";
import type {
  IEtatCivil,
  IImmatriculation,
  IPersonneMorale,
} from "../../../models/rne";
import type { Siren } from "../../../models/siren-and-siret";
import { libelleFromCodeRoleDirigeant } from "../../../utils/helpers/labels";
import { logWarningInSentry } from "../../../utils/sentry";
import routes from "../../urls";
import { formatINPIDateField } from "../helper";
import { defaultApiRneClient } from "./auth";
import type {
  IRNEInscriptionsOffices,
  IRNEPersonneMorale,
  IRNEPersonnePhysique,
  IRNEResponse,
} from "./interface";

export const fetchImmatriculationFromAPIRNE = async (
  siren: Siren,
  useCache = true,
  signal?: AbortSignal
) => {
  const data = await defaultApiRneClient.get<IRNEResponse>(
    routes.inpi.api.rne.cmc.companies + siren,
    { timeout: constants.timeout.XXXL, useCache },
    signal
  );

  const inscriptionsOffices =
    data.formality?.content?.inscriptionsOffices ?? [];

  if (data.formality.content.personnePhysique) {
    return mapPersonnePhysiqueToDomainObject(
      data.formality.content.personnePhysique,
      inscriptionsOffices,
      siren
    );
  }

  const { personneMorale, exploitation } = data.formality.content;

  if (personneMorale || exploitation) {
    return mapPersonneMoraleToDomainObject(
      (personneMorale || exploitation) as IRNEPersonneMorale,
      inscriptionsOffices,
      siren
    );
  }

  logWarningInSentry("RNE : no personne moral nor personne physique found", {
    siren,
  });

  throw new HttpNotFound(siren);
};

const mapPersonneMoraleToDomainObject = (
  pm: IRNEPersonneMorale,
  inscriptionsOffices: IRNEInscriptionsOffices[],
  siren: Siren
): IImmatriculation => {
  return {
    siren,
    dirigeants: mapDirigeantsToDomainObject(pm?.composition?.pouvoirs),
    beneficiaires: [],
    observations: [
      // observations équivalent in RNE
      ...inscriptionsOffices
        .filter((i: IRNEInscriptionsOffices) => !!i.observationComplementaire)
        .map((i: IRNEInscriptionsOffices) => ({
          numObservation: "NC",
          description: `${i.partnerCenter ? `${i.partnerCenter} : ` : ""}${
            i.observationComplementaire ?? "observation vide"
          }`,
          dateAjout: i.dateEffet ?? "",
        })),
      // old observations - come from old RCS records. Not sure it exist for RNM or RAA
      ...(pm?.observations?.rcs || []).map((o) => {
        const { numObservation = "", texte = "", dateAjout = "" } = o || {};
        return {
          numObservation,
          description: texte.trimStart().trimEnd(),
          dateAjout: formatINPIDateField(dateAjout),
        };
      }),
    ],
    metadata: {
      isFallback: false,
    },
  };
};

const mapPersonnePhysiqueToDomainObject = (
  pp: IRNEPersonnePhysique,
  inscriptionsOffices: IRNEInscriptionsOffices[],
  siren: Siren
): IImmatriculation => {
  const {
    prenoms = [""],
    nom = "",
    dateDeNaissance = "",
  } = pp?.identite.entrepreneur?.descriptionPersonne || {};

  return {
    siren,
    dirigeants: [
      {
        nom,
        prenom: prenoms.join(", "),
        role: "",
        dateNaissancePartial: dateDeNaissance,
        dateNaissanceFull: "",
        estDemissionnaire: false,
        dateDemission: null,
      },
    ],
    beneficiaires: [],
    // inscriptionsOffices are the new way to name observations in RNE
    // not sure there are old observations for EI
    observations: inscriptionsOffices
      .filter((i: IRNEInscriptionsOffices) => !!i.observationComplementaire)
      .map((i: IRNEInscriptionsOffices) => ({
        numObservation: "NC",
        description: `${i.partnerCenter ? `${i.partnerCenter} : ` : ""}${
          i.observationComplementaire
        }`,
        dateAjout: i.dateEffet ?? "",
      })),
    metadata: {
      isFallback: false,
    },
  };
};

const mapDirigeantsToDomainObject = (
  pouvoirs: IRNEPersonneMorale["composition"]["pouvoirs"] = []
) =>
  pouvoirs.map((p) => {
    if (p.individu) {
      const {
        nom = "",
        prenoms = [],
        nomUsage = "",
        dateDeNaissance = "",
      } = p.individu?.descriptionPersonne || {};

      const nomComplet = `${
        nomUsage && nom ? `${nomUsage} (${nom})` : `${nomUsage || nom || ""}`
      }`;

      const role =
        p.libelleRoleEntreprise ||
        libelleFromCodeRoleDirigeant(p?.roleEntreprise);

      return {
        nom: nomComplet,
        prenom: prenoms.join(", "),
        role,
        dateNaissancePartial: dateDeNaissance,
        dateNaissanceFull: "",
        estDemissionnaire: p.mentionDemissionOrdre,
        dateDemission: p.dateMentionDemissionOrdre ?? null,
      } as IEtatCivil;
    }
    const {
      siren = "",
      denomination = "",
      roleEntreprise = "",
      formeJuridique = "",
    } = p.entreprise || {};

    const role =
      p.libelleRoleEntreprise || libelleFromCodeRoleDirigeant(roleEntreprise);

    return {
      siren,
      denomination,
      natureJuridique: formeJuridique,
      role,
    } as IPersonneMorale;
  }) || [];
