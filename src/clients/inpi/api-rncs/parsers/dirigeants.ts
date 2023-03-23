//==============
// Representants
//==============

import {
  formatFirstNames,
  formatNameFull,
} from '../../../../utils/helpers/formatters';
import { formatINPIDateFieldPartial } from '../../helper';

import { IRNCSRepresentantResponse, IRNCSResponseDossier } from '..';
import { IDirigeant } from '../../../../models/imr';
import { logWarningInSentry } from '../../../../utils/sentry';

export const extractRepresentants = (dossier: IRNCSResponseDossier) => {
  const representantsObject = dossier?.representants?.representant;

  if (!representantsObject) {
    if (!dossier.identite || !dossier.identite.identite_PP) {
      logWarningInSentry('API RNCS Inconsistency', {
        siren: dossier['@_siren'],
        details: 'No Dirigeant found',
      });
      return [];
    }
    const representantEI = extractDirigeantFromIdentite(dossier);
    return [representantEI];
  }

  const representants = Array.isArray(representantsObject)
    ? representantsObject
    : [representantsObject];

  return representants.map(mapToDomainDirigeant);
};

const mapToDomainDirigeant = (
  dirigeant: IRNCSRepresentantResponse
): IDirigeant => {
  const {
    prenoms = '',
    nom_patronymique,
    nom_usage,
    dat_naiss = '',
    qualites,
    form_jur = '',
    siren,
    denomination = '',
    type,
  } = dirigeant;

  const qualite = (qualites || {}).qualite;
  const roles = Array.isArray(qualite) ? qualite.join(', ') : qualite;

  if (type === 'P.Physique') {
    return {
      prenom: formatFirstNames(prenoms),
      nom: formatNameFull(nom_patronymique, nom_usage),
      role: roles || '',
      dateNaissancePartial: formatINPIDateFieldPartial(dat_naiss),
    };
  } else {
    const sirenAsString = (siren || '').toString();
    return {
      siren: sirenAsString,
      denomination: denomination,
      role: roles || '',
      natureJuridique: form_jur,
    };
  }
};

export const extractDirigeantFromIdentite = (
  dossierPrincipal: IRNCSResponseDossier
) => {
  return mapToDomainFromIdentite(dossierPrincipal);
};

const mapToDomainFromIdentite = (
  dossierPrincipal: IRNCSResponseDossier
): IDirigeant => {
  const {
    identite_PP: { nom_patronymique, nom_usage, prenom = '', dat_naiss = '' },
  } = dossierPrincipal.identite;

  return {
    prenom: formatFirstNames(prenom),
    nom: formatNameFull(nom_patronymique, nom_usage),
    role: 'Représentant Légal',
    dateNaissancePartial: formatINPIDateFieldPartial(dat_naiss),
  };
};
