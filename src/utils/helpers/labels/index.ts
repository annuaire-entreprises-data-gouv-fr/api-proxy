import { codesGreffes } from './codes-greffes';
import { codesBeneficiaires } from './codes-beneficiaires';
import { categoriesJuridiques } from './code-juridiques';
import { codeRoleEntreprise } from './code-role-entreprise';
import { codeNatureEntreprise } from './code-nature-entreprise';

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

export const libelleFromCodeRoleEntreprise = (code: string) =>
  //@ts-ignore
  codeRoleEntreprise[code] || null;

export const libelleFromCodeNatureEntreprise = (code: string) =>
  //@ts-ignore
  codeNatureEntreprise[code] || null;
