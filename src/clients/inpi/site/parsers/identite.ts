import { escapeTerm } from "../../../../utils/helpers/formatters";
import { formatINPIDateField } from "../../helper";
import { extractFromHtmlBlock } from "./helpers";

const parseIdentiteBlocks = (identiteHtml: Element) => {
  const blocsHtml = identiteHtml.querySelectorAll("div.bloc-detail-notice");

  const parsedBlocs = {} as any;

  for (let i = 0; i < blocsHtml.length; i++) {
    const { label, text } = extractFromHtmlBlock(blocsHtml[i]);
    parsedBlocs[escapeTerm(label)] = text;
  }
  return parsedBlocs;
};

const parseIdentite = (identiteHtml: Element, radiationText: string) => {
  const parsedBlocks = parseIdentiteBlocks(identiteHtml);
  const get = (key: string) => parsedBlocks[escapeTerm(key)] || null;
  const getDate = (key: string) => formatINPIDateField(get(key)) || null;

  const radiationDate =
    radiationText.replace("(Entreprise radiée le ", "").replace(")", "") || "";

  if (get("Dénomination")) {
    // personne morale
    return {
      dateImmatriculation: getDate("Date d'immatriculation"),
      dateDebutActiv: getDate("Début d’activité"),
      dateRadiation: formatINPIDateField(radiationDate) || null,
      dateCessationActivite: getDate("Date de cessation d'activité"),
      denomination: get("Dénomination"),
      dureePersonneMorale: get("Durée de la personne morale"),
      dateClotureExercice: get("Date de clôture"),
      capital: (get("Capital social") || "").trim(),
      isPersonneMorale: true,
      libelleNatureJuridique: get("Forme juridique"),
      natureEntreprise: get("Nature de l'entreprise"),
    };
  }
  return {
    dateImmatriculation: getDate("Date d'immatriculation"),
    dateDebutActiv: getDate("Début d’activité"),
    dateRadiation: formatINPIDateField(radiationDate) || null,
    dateCessationActivite: getDate("Date de cessation d'activité"),
    denomination: get("Nom, Prénom(s)"),
    dureePersonneMorale: null,
    dateClotureExercice: null,
    capital: null,
    isPersonneMorale: false,
    libelleNatureJuridique: "Entreprise individuelle",
    natureEntreprise: get("Nature de l'entreprise"),
  };
};

export const extractDirigeantFromIdentite = (identiteHtml: Element) => {
  const parsedBlocks = parseIdentiteBlocks(identiteHtml);
  const [nom = "", prenom = ""] = (
    parsedBlocks[escapeTerm("Nom, Prénom(s)")] || ""
  ).split(",");

  return {
    prenom: prenom.replace("&nbsp;", "").trim(),
    nom: nom.trim(),
    role: "Représentant Légal",
    lieuNaissance: null,
    dateNaissancePartial: "",
    dateNaissanceFull: null,
  };
};

export default parseIdentite;
