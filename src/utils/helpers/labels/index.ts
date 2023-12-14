import { codesGreffes } from './codes-greffes';
import { codesBeneficiaires } from './codes-beneficiaires';
import { categoriesJuridiques } from './code-juridiques';
import { codeNatureEntreprise } from './code-nature-entreprise';
import { codeRolesDirigeants } from './code-roles-dirigeants';

export const libelleFromCodeRoleDirigeant = (codeRole: string) => {
  //@ts-ignore
  return codeRolesDirigeants[codeRole] || codeRole;
};

export const libelleFromCodeGreffe = (codeGreffe: string) => {
  //@ts-ignore
  return codesGreffes[codeGreffe] || codeGreffe;
};

export const libelleFromCodeBeneficiaires = (codeBeneficiaires: string) => {
  //@ts-ignore
  return codesBeneficiaires[codeBeneficiaires] || codeBeneficiaires;
};

export const libelleFromCategoriesJuridiques = (categorie: string) =>
  //@ts-ignore
  categoriesJuridiques[categorie] || null;

export const libelleFromCodeNatureEntreprise = (code: string) =>
  //@ts-ignore
  codeNatureEntreprise[code] || null;
