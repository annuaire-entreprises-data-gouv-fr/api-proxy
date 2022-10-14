//==============
// Beneficiaires
//==============

import {
  formatFirstNames,
  formatNameFull,
} from '../../../../utils/helpers/formatters';
import { formatINPIDateField, formatINPIDateFieldPartial } from '../../helper';
import { IRNCSBeneficiaireResponse, IRNCSResponseDossier } from '..';
import { IBeneficiaire } from '../../../../models/imr';
import { libelleFromCodeBeneficiaires } from '../../../../utils/helpers/labels';

export const extractBeneficiaires = (dossier: IRNCSResponseDossier) => {
  const beneficiairesObject = dossier?.beneficiaires?.beneficiaire;

  if (!beneficiairesObject) {
    // no beneficiaires found or declared
    return [];
  }

  const beneficiaires = Array.isArray(beneficiairesObject)
    ? beneficiairesObject
    : [beneficiairesObject];

  return beneficiaires.map(mapToDomainBeneficiaires);
};

const mapToDomainBeneficiaires = (
  beneficiaire: IRNCSBeneficiaireResponse
): IBeneficiaire => {
  const {
    date_greffe,
    type_entite,
    nom_naissance,
    prenoms = '',
    date_naissance = '',
    nationalite = '',
  } = beneficiaire;

  return {
    type: libelleFromCodeBeneficiaires(type_entite),
    nom: formatNameFull(nom_naissance, ''),
    prenoms: formatFirstNames(prenoms),
    dateNaissancePartial: formatINPIDateFieldPartial(date_naissance),
    dateGreffe: formatINPIDateField(date_greffe),
    nationalite: nationalite,
  };
};
