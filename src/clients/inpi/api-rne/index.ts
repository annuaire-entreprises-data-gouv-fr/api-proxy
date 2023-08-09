import constants from '../../../constants';
import { HttpNotFound } from '../../../http-exceptions';
import {
  IImmatriculation,
  IPersonneMorale,
  IEtatCivil,
} from '../../../models/rne';
import { Siren } from '../../../models/siren-and-siret';
import { authApiRneClient } from '../../../utils/auth/api-rne';
import { formatFloatFr } from '../../../utils/helpers/formatters';
import {
  libelleFromCategoriesJuridiques,
  libelleFromCodeNatureEntreprise,
  libelleFromCodeRoleEntreprise,
} from '../../../utils/helpers/labels';
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
      data.formality.content.formeExerciceActivitePrincipale,
      siren
    );
  }
  if (data.formality.content.personneMorale) {
    return mapPersonneMoraleToDomainObject(
      data.formality.content.personneMorale,
      data.formality.content.formeExerciceActivitePrincipale,
      siren
    );
  }
  throw new HttpNotFound(siren);
};

const mapPersonneMoraleToDomainObject = (
  pm: IRNEResponse['formality']['content']['personneMorale'],
  natureEntreprise = '',
  siren: Siren
): IImmatriculation => {
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
      dateRadiation: formatINPIDateField(
        (pm?.detailCessationEntreprise?.dateRadiation || '').split('T')[0]
      ),
      dateCessationActivite: '',
      isPersonneMorale: true,
      dateClotureExercice: dateClotureExerciceSocial,
      dureePersonneMorale: duree ? `${duree.toString()} ans` : '',
      capital,
      libelleNatureJuridique: libelleFromCategoriesJuridiques(formeJuridique),
      natureEntreprise: libelleFromCodeNatureEntreprise(natureEntreprise),
    },
    dirigeants:
      (pm?.composition?.pouvoirs || []).map((p) => {
        if (!!p.individu) {
          const {
            nom = '',
            prenoms = [],
            dateDeNaissance = '',
          } = p.individu?.descriptionPersonne || {};
          return {
            nom,
            prenom: prenoms[0],
            role: '',
            dateNaissancePartial: dateDeNaissance,
            dateNaissanceFull: '',
          } as IEtatCivil;
        } else {
          const {
            siren = '',
            denomination = '',
            roleEntreprise = '',
            formeJuridique = '',
          } = p.entreprise || {};

          return {
            siren,
            denomination,
            natureJuridique: formeJuridique,
            role: libelleFromCodeRoleEntreprise(roleEntreprise),
          } as IPersonneMorale;
        }
      }) || [],
    beneficiaires:
      (pm?.beneficiairesEffectifs || []).map((b) => {
        const {
          dateDeNaissance = '',
          nom = '',
          prenoms = '',
          nationalite,
        } = b?.beneficiaire?.descriptionPersonne || {};

        return {
          type: '',
          nom,
          prenoms: prenoms.join(', '),
          dateNaissancePartial: dateDeNaissance,
          nationalite,
        };
      }) || [],
    observations:
      (pm?.observations?.rcs || []).map((o) => {
        const { numObservation = '', texte = '', dateAjout = '' } = o || {};
        return {
          numObservation,
          description: texte.trimStart().trimEnd(),
          dateAjout: formatINPIDateField(dateAjout),
        };
      }) || [],
    metadata: {
      isFallback: false,
    },
  };
};

const mapPersonnePhysiqueToDomainObject = (
  pp: IRNEResponse['formality']['content']['personnePhysique'],
  natureEntreprise = '',
  siren: Siren
): IImmatriculation => {
  const {
    dateImmat = '',
    formeJuridique = '',
    dateDebutActiv = '',
  } = pp?.identite?.entreprise || {};

  const {
    prenoms = [''],
    nomUsage = '',
    nom = '',
  } = pp?.identite.entrepreneur?.descriptionPersonne || {};
  const prenom = prenoms[0];

  const denomination = `${prenom} ${
    nomUsage && nom ? `${nomUsage} (${nom})` : `${nomUsage || nom || ''}`
  }`;

  return {
    siren,
    identite: {
      denomination: denomination || '',
      dateImmatriculation: formatINPIDateField(dateImmat || '').split('T')[0],
      dateDebutActiv,
      dateRadiation: formatINPIDateField(
        (pp?.detailCessationEntreprise?.dateRadiation || '').split('T')[0]
      ),
      dateCessationActivite: '',
      isPersonneMorale: false,
      dateClotureExercice: '',
      dureePersonneMorale: '',
      capital: '',
      libelleNatureJuridique: libelleFromCategoriesJuridiques(formeJuridique),
      natureEntreprise: libelleFromCodeNatureEntreprise(natureEntreprise),
    },
    dirigeants: [
      {
        nom,
        prenom,
        role: '',
        dateNaissancePartial: '',
        dateNaissanceFull: '',
      },
    ],
    beneficiaires: [],
    observations: [],
    metadata: {
      isFallback: false,
    },
  };
};
