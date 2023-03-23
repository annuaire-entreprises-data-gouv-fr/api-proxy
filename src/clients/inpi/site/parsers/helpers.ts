export const cleanTextFromHtml = (raw = '') =>
  raw.replace('\n', '').replace(/\s+/g, ' ').replace('<br>', '').trim();

/**
 * converts a html block of two adjacents <p> into a {label, text }
 * @param block
 * @returns
 */
export const extractFromHtmlBlock = (block: Element) => {
  const label = cleanTextFromHtml(
    block.querySelector('p:first-of-type')?.innerHTML
  );

  const text = cleanTextFromHtml(
    block.querySelector('p:last-of-type')?.innerHTML
  );
  return { label, text };
};

/**
 * Extract name and roles from a string, following INPI formating of "name surname" using only the first word as family name
 * Role is optionnal
 * @param rawNameAndRole
 * @returns
 */
export const parseNameAndRole = (rawNameAndRole = '') => {
  const response = {
    nom: null,
    prenom: null,
    role: null,
  } as any;

  if (!rawNameAndRole) {
    return response;
  }

  const [nameRaw, firstName] = rawNameAndRole.split('</span>');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_spanPrefix, name] = nameRaw.split('class="inpi-bold">');

  if (!name && !firstName) {
    response.nom = rawNameAndRole;
  } else {
    response.nom = (name || '').toUpperCase().trim();
    response.prenom = (firstName || '')
      .toUpperCase()
      .trim()
      .replaceAll(' , ', ', ');
  }

  return response;
};
