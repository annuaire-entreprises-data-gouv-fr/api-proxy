export const capitalize = (str: string) => {
  if (!str) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
};

export const formatIntFr = (intAsString = "") => {
  try {
    return intAsString.replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
  } catch {
    return intAsString;
  }
};

export const formatFloatFr = (floatAsString = "") => {
  try {
    const floatAsNumber = Number.parseFloat(floatAsString);
    return new Intl.NumberFormat("fr-FR").format(floatAsNumber);
  } catch {
    return floatAsString;
  }
};

const WHITESPACE_END = /\s+$/;
const WHITESPACE_START = /^\s+/;

/**
 * Normalize string and remove special chars & diacritics before using a term in search
 */
export const escapeTerm = (term: string) =>
  term
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(WHITESPACE_END, "")
    .replace(WHITESPACE_START, "");

const WHITESPACE_COMMA = /[,\s]+/;

export const formatFirstNames = (firstNamesRaw: string) => {
  const firstNames = firstNamesRaw.split(WHITESPACE_COMMA);

  if (firstNames.length > 0) {
    return capitalize(firstNames[0]);
  }
  return "";
};

export const formatNameFull = (nomPatronymique = "", nomUsage = "") => {
  if (nomUsage && nomPatronymique) {
    return `${capitalize(nomUsage)} (${capitalize(nomPatronymique)})`;
  }
  return capitalize(nomUsage || nomPatronymique || "");
};
