import { codesGreffes } from './codes-greffes';
import { codesBeneficiaires } from './codes-beneficiaires';
import { categoriesJuridiques } from './code-juridiques';

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
