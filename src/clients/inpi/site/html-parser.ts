import { JSDOM } from 'jsdom';
import {
  IBeneficiaire,
  IDirigeant,
  IIdentite,
  IObservation,
} from '../../../models/rne';
import { Siren } from '../../../models/siren-and-siret';

import parseDirigeants from './parsers/dirigeants';
import parseIdentite, {
  extractDirigeantFromIdentite,
} from './parsers/identite';
import { HttpServerError } from '../../../http-exceptions';
import parseObservations from './parsers/observations';

export class InvalidFormatError extends HttpServerError {
  constructor(message: string) {
    super('Unable to parse HTML :' + message);
  }
}

const clean = (raw = '') => raw.replace('\n', '').replace(/\s+/g, ' ').trim();

const extractImmatriculationFromHtml = (
  html: string,
  _siren: Siren
): {
  dirigeants: IDirigeant[];
  beneficiaires: IBeneficiaire[];
  identite: IIdentite;
  observations: IObservation[];
} => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const container = document.querySelector(
    'div#notice-description > div.bloc-without-img'
  );

  if (!container) {
    throw new InvalidFormatError('Cannot find Inpi container');
  }

  const rowsHtml = container.querySelectorAll('div.row');

  const response = {
    identite: null,
    dirigeants: [],
    beneficiaires: [],
    observations: [],
  } as any;

  let rawIdentite;

  const radiationText =
    container.querySelector('p.company-removed')?.textContent || '';

  for (let i = 0; i < rowsHtml.length; i++) {
    const row = rowsHtml[i];
    const title = clean(row.querySelector('h2, h3, h4, h5')?.innerHTML);

    switch (title) {
      case 'Identité':
        response.identite = parseIdentite(row, radiationText);
        rawIdentite = row;
        break;
      case 'Représentants':
        response.dirigeants = parseDirigeants(row);
        break;
      case 'Bénéficiaires effectifs':
        break;
      default:
    }
  }

  const observationsHtml = container.querySelectorAll(
    '#observations + div.row, #observations-other > div.row'
  );
  response.observations = parseObservations(observationsHtml);

  // EI
  if (
    response.dirigeants.length === 0 &&
    response.identite.isPersonneMorale === false &&
    rawIdentite
  ) {
    response.dirigeants = [extractDirigeantFromIdentite(rawIdentite)];
  }

  return response;
};

export { extractImmatriculationFromHtml };
