import constants from '../../../constants';
import { HttpNotFound } from '../../../http-exceptions';
import { IImmatriculationRne } from '../../../models/rne';
import { Siren } from '../../../models/siren-and-siret';
import { authApiRneClient } from '../../../utils/auth/api-rne';
import { formatFloatFr } from '../../../utils/helpers/formatters';
import routes from '../../urls';
import { formatINPIDateField } from '../helper';
import { IRNEResponse } from './interface';

export const fetchImmatriculationFromAPIRNE = async (siren: Siren) => {
  const response = await authApiRneClient(
    routes.inpi.api.rne.cmc.companies + siren,
    { timeout: constants.timeout.M }
  );
  const data = response.data as IRNEResponse;

  if (data.formality.content.personnePhysique) {
    return mapPersonnePhysiqueToDomainObject(
      data.formality.content.personnePhysique,
      siren
    );
  }
  if (data.formality.content.personneMorale) {
    return mapPersonneMoraleToDomainObject(
      data.formality.content.personneMorale,
      siren
    );
  }
  throw new HttpNotFound(siren);
};

const mapPersonneMoraleToDomainObject = (
  pm: IRNEResponse['formality']['content']['personneMorale'],
  siren: Siren
): IImmatriculationRne => {
  const {
    montantCapital = 0,
    deviseCapital = '€',
    capitalVariable = false,
    duree = 0,
    dateClotureExerciceSocial = '',
  } = pm?.identite.description || {};

  const {
    denomination = '',
    formeJuridique = '',
    dateImmat = '',
    nomCommercial = '',
    sigle = '',
    dateRad = '',
    dateDebutActiv = '',
  } = pm?.identite.entreprise || {};

  const denominationComplete = `${denomination || 'Nom inconnu'}${
    nomCommercial ? ` (${nomCommercial})` : ''
  }${sigle ? ` (${sigle})` : ''}`;

  const capital = montantCapital
    ? `${formatFloatFr(montantCapital.toString())} ${deviseCapital} (${
        capitalVariable ? 'variable' : 'fixe'
      })`
    : '';

  return {
    siren,
    identite: {
      denomination: denominationComplete,
      dateImmatriculation: formatINPIDateField(dateImmat || '').split('T')[0],
      dateDebutActiv: dateDebutActiv,
      dateRadiation: dateRad,
      dateCessationActivite: '',
      isPersonneMorale: true,
      dateClotureExercice: dateClotureExerciceSocial,
      dureePersonneMorale: duree ? `${duree.toString()} ans` : '',
      capital,
      codeNatureJuridique: formeJuridique,
    },
    metadata: {
      isFallback: false,
    },
  };
};

const mapPersonnePhysiqueToDomainObject = (
  pm: IRNEResponse['formality']['content']['personnePhysique'],
  siren: Siren
): IImmatriculationRne => {
  const formeJuridique = '1000';

  const {
    prenoms = [''],
    nomUsage = '',
    nom = '',
  } = pm?.identite.entrepreneur?.descriptionPersonne || {};
  const prenom = prenoms[0];

  const denomination = `${prenom} ${
    nomUsage && nom ? `${nomUsage} (${nom})` : `${nomUsage || nom || ''}`
  }`;

  return {
    siren,
    identite: {
      denomination: denomination || '',
      dateImmatriculation: '',
      dateDebutActiv: '',
      dateRadiation: '',
      dateCessationActivite: '',
      isPersonneMorale: false,
      dateClotureExercice: '',
      dureePersonneMorale: '',
      capital: '',
      codeNatureJuridique: formeJuridique,
    },
    metadata: {
      isFallback: false,
    },
  };
};
