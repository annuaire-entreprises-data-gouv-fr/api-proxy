import constants from '../../../constants';
import { HttpNotFound } from '../../../http-exceptions';
import {
  IEtatCivil,
  IImmatriculation,
  IPersonneMorale,
} from '../../../models/rne';
import { Siren } from '../../../models/siren-and-siret';
import { formatFloatFr } from '../../../utils/helpers/formatters';
import {
  libelleFromCategoriesJuridiques,
  libelleFromCodeNatureEntreprise,
  libelleFromCodeRoleDirigeant,
} from '../../../utils/helpers/labels';
import { logWarningInSentry } from '../../../utils/sentry';
import routes from '../../urls';
import { formatINPIDateField } from '../helper';
import { defaultApiRneClient } from './auth';
import {
  IRNEInscriptionsOffices,
  IRNEPersonneMorale,
  IRNEPersonnePhysique,
  IRNEResponse,
} from './interface';

export const fetchImmatriculationFromAPIRNE = async (
  siren: Siren,
  useCache = true
) => {
  const data = await defaultApiRneClient.get<IRNEResponse>(
    routes.inpi.api.rne.cmc.companies + siren,
    { timeout: constants.timeout.XXXL, useCache }
  );

  const inscriptionsOffices =
    data.formality?.content?.inscriptionsOffices ?? [];

  if (data.formality.content.personnePhysique) {
    return mapPersonnePhysiqueToDomainObject(
      data.formality.content.personnePhysique,
      data.formality.content.formeExerciceActivitePrincipale,
      inscriptionsOffices,
      siren
    );
  }

  const { personneMorale, exploitation } = data.formality.content;

  if (personneMorale || exploitation) {
    return mapPersonneMoraleToDomainObject(
      (personneMorale || exploitation) as IRNEPersonneMorale,
      data.formality.content.formeExerciceActivitePrincipale,
      inscriptionsOffices,
      siren
    );
  }

  logWarningInSentry('RNE : no personne moral nor personne physique found', {
    siren,
  });

  throw new HttpNotFound(siren);
};

const mapPersonneMoraleToDomainObject = (
  pm: IRNEPersonneMorale,
  natureEntreprise = '',
  inscriptionsOffices: IRNEInscriptionsOffices[],
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
        (
          pm?.detailCessationEntreprise?.dateRadiation ||
          pm?.detailCessationEntreprise?.dateEffet ||
          ''
        ).split('T')[0]
      ),
      dateCessationActivite: (
        pm?.detailCessationEntreprise?.dateCessationTotaleActivite || ''
      ).split('T')[0],
      isPersonneMorale: true,
      dateClotureExercice: dateClotureExerciceSocial,
      dureePersonneMorale: duree || 0,
      capital,
      libelleNatureJuridique: libelleFromCategoriesJuridiques(formeJuridique),
      natureEntreprise: libelleFromCodeNatureEntreprise(natureEntreprise),
    },
    dirigeants: mapDirigeantsToDomainObject(pm?.composition?.pouvoirs),
    beneficiaires: [],
    observations: [
      // observations équivalent in RNE
      ...inscriptionsOffices
        .filter((i: IRNEInscriptionsOffices) => !!i.observationComplementaire)
        .map((i: IRNEInscriptionsOffices) => {
          return {
            numObservation: 'NC',
            description: `${i.partnerCenter ? `${i.partnerCenter} : ` : ''}${
              i.observationComplementaire ?? 'observation vide'
            }`,
            dateAjout: i.dateEffet ?? '',
          };
        }),
      // old observations - come from old RCS records. Not sure it exist for RNM or RAA
      ...(pm?.observations?.rcs || []).map((o) => {
        const { numObservation = '', texte = '', dateAjout = '' } = o || {};
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
  natureEntreprise = '',
  inscriptionsOffices: IRNEInscriptionsOffices[],
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
      dateCessationActivite: (
        pp?.detailCessationEntreprise?.dateCessationTotaleActivite || ''
      ).split('T')[0],
      isPersonneMorale: false,
      dateClotureExercice: '',
      dureePersonneMorale: 0,
      capital: '',
      libelleNatureJuridique: libelleFromCategoriesJuridiques(formeJuridique),
      natureEntreprise: libelleFromCodeNatureEntreprise(natureEntreprise),
    },
    dirigeants: [
      {
        nom,
        prenom: prenoms.join(', '),
        role: '',
        dateNaissancePartial: '',
        dateNaissanceFull: '',
      },
    ],
    beneficiaires: [],
    // inscriptionsOffices are the new way to name observations in RNE
    // not sure there are old observations for EI
    observations: inscriptionsOffices
      .filter((i: IRNEInscriptionsOffices) => !!i.observationComplementaire)
      .map((i: IRNEInscriptionsOffices) => {
        return {
          numObservation: 'NC',
          description: `${i.partnerCenter ? `${i.partnerCenter} : ` : ''}${
            i.observationComplementaire
          }`,
          dateAjout: i.dateEffet ?? '',
        };
      }),
    metadata: {
      isFallback: false,
    },
  };
};

const mapDirigeantsToDomainObject = (
  pouvoirs: IRNEPersonneMorale['composition']['pouvoirs'] = []
) =>
  pouvoirs.map((p) => {
    if (!!p.individu) {
      const {
        nom = '',
        prenoms = [],
        nomUsage = '',
        dateDeNaissance = '',
      } = p.individu?.descriptionPersonne || {};

      const nomComplet = `${
        nomUsage && nom ? `${nomUsage} (${nom})` : `${nomUsage || nom || ''}`
      }`;

      const role =
        p.libelleRoleEntreprise ||
        libelleFromCodeRoleDirigeant(p?.individu?.descriptionPersonne.role);

      return {
        nom: nomComplet,
        prenom: prenoms.join(', '),
        role,
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

      const role =
        p.libelleRoleEntreprise || libelleFromCodeRoleDirigeant(roleEntreprise);

      return {
        siren,
        denomination,
        natureJuridique: formeJuridique,
        role,
      } as IPersonneMorale;
    }
  }) || [];
