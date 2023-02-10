/**
 * Format INPI date field (string or number) to relevant format YYYY-MM-DD
 * @param unformatted
 * @returns formatted date
 */
export const formatINPIDateField = (unformatted: string | number): string => {
  if (!unformatted) {
    return '';
  }

  if (typeof unformatted === 'number') {
    // YYYYMMDD as number
    const YYYYMMDD = unformatted.toString();
    return `${YYYYMMDD.substr(0, 4)}-${YYYYMMDD.substr(4, 2)}-${YYYYMMDD.substr(
      6
    )}`;
  } else if (unformatted.indexOf('/') === 2) {
    // DD/MM/YYYY
    const times = unformatted.split('/');
    return `${times[2]}-${times[1]}-${times[0]}`;
  } else if (unformatted.indexOf('-') === 2) {
    // DD-MM-YYYY
    const times = unformatted.split('-');
    return `${times[2]}-${times[1]}-${times[0]}`;
  } else if (unformatted.indexOf('-') === 4) {
    // YYYY-MM-DD
    return unformatted;
  } else {
    throw new Error('Unknown date format');
  }
};

/**
 * Format INPI date field (string or number) to relevant format MM/YYYY
 * @param unformatted
 * @returns formatted date
 */
export const formatINPIDateFieldPartial = (unformatted: string | number) => {
  if (!unformatted) {
    return '';
  }
  if (typeof unformatted === 'number') {
    // YYYYMMDD as number
    const YYYYMMDD = unformatted.toString();
    return `${YYYYMMDD.slice(0, 4)}-${YYYYMMDD.slice(4, 6)}`;
  } else if (unformatted.indexOf('/') === 2 && unformatted.length === 7) {
    // MM/YYYY
    const times = unformatted.split('/');
    return `${times[1]}-${times[0]}`;
  } else {
    throw new Error('Unknown date format');
  }
};
