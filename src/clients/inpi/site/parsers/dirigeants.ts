import { IEtatCivil, IPersonneMorale } from '../../../../models/imr';
import { formatINPIDateFieldPartial } from '../../helper';
import { extractFromHtmlBlock, parseNameAndRole } from './helpers';

const parseDirigeants = (dirigeantsHtml: Element) => {
  const dirigeants = [] as (IEtatCivil | IPersonneMorale)[];

  // parse each sub section and look for a dirigeant
  const blocsHtml = dirigeantsHtml.querySelectorAll('div.col-12');

  let current = {} as any;

  for (let i = 0; i < blocsHtml.length; i++) {
    const { label, text } = extractFromHtmlBlock(blocsHtml[i]);

    if (label.indexOf('Nom,') === 0) {
      if (i !== 0) {
        dirigeants.push(current);
      }
      const { nom, prenom } = parseNameAndRole(text);
      current = {
        nom,
        prenom,
        role: '',
        dateNaissancePartial: '',
      };
    }

    if (label.indexOf('Nom d') === 0) {
      const nomUsage = (text || '').toUpperCase();
      if (current.nom) {
        current.nom = `${nomUsage} (${current.nom})`;
      } else {
        current.nom = nomUsage;
      }
    }
    if (label.indexOf('Qualité') === 0) {
      current.role = text;
    }
    if (label.indexOf('Date de naissance') === 0) {
      current.dateNaissancePartial = formatINPIDateFieldPartial(text);
    }

    if (label.indexOf('Dénomination') === 0) {
      if (i !== 0) {
        dirigeants.push(current);
      }
      current = {
        denomination: text,
        siren: '',
        natureJuridique: '',
        role: '',
      };
    }
  }
  if (current) {
    dirigeants.push(current);
  }

  return dirigeants;
};

export default parseDirigeants;
