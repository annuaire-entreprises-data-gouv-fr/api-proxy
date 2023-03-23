//==============
// Identite / Immatriculation
//==============

import { formatFloatFr } from '../../../../utils/helpers/formatters';
import { IRNCSIdentiteResponse, IRNCSResponseDossier } from '..';
import { formatINPIDateField } from '../../helper';
import { IIdentite } from '../../../../models/imr';

export const extractIdentite = (dossierPrincipal: IRNCSResponseDossier) => {
  return mapToDomainIdentite(dossierPrincipal.identite);
};

const mapToDomainIdentite = (identite: IRNCSIdentiteResponse): IIdentite => {
  const {
    dat_immat,
    date_debut_activ,
    dat_1ere_immat,
    identite_PM,
    identite_PP,
    dat_rad,
    dat_cessat_activite,
  } = identite;

  const isPP = !identite_PM;

  const dateImmatriculation = dat_1ere_immat
    ? formatINPIDateField(dat_1ere_immat)
    : dat_immat
    ? formatINPIDateField(dat_immat)
    : '';

  const infosIdentite = {
    dateImmatriculation,
    dateDebutActiv: formatINPIDateField(date_debut_activ),
    dateRadiation: formatINPIDateField(dat_rad),
    dateCessationActivite: formatINPIDateField(dat_cessat_activite),
  };
  if (isPP) {
    const { prenom, nom_patronymique } = identite_PP;

    const denominationPP =
      prenom || nom_patronymique ? `${prenom} ${nom_patronymique}` : '';

    return {
      ...infosIdentite,
      denomination: denominationPP,
      isPersonneMorale: false,
      dureePersonneMorale: '',
      dateClotureExercice: '',
      capital: '',
      libelleNatureJuridique: 'Entreprise individuelle',
      natureEntreprise: '',
    };
  } else {
    const {
      denomination,
      sigle,
      type_cap,
      montant_cap,
      devise_cap,
      duree_pm,
      dat_cloture_exer,
      form_jur,
    } = identite_PM;

    const capital =
      isPP || !montant_cap
        ? ''
        : `${formatFloatFr(montant_cap)} ${devise_cap} (${
            type_cap === 'F' ? 'fixe' : 'variable'
          })`;

    const denominationPM = denomination + (sigle ? `(${sigle})` : '');
    return {
      ...infosIdentite,
      denomination: denominationPM,
      dureePersonneMorale: duree_pm ? `${duree_pm} ans` : '',
      dateClotureExercice: dat_cloture_exer || '',
      capital,
      isPersonneMorale: true,
      libelleNatureJuridique: form_jur || '',
      natureEntreprise: '',
    };
  }
};
