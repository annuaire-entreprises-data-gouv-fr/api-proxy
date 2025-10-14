import { categoriesJuridiques } from "./code-juridiques";
import { codeNatureEntreprise } from "./code-nature-entreprise";
import { codeRolesDirigeants } from "./code-roles-dirigeants";
import { codesBeneficiaires } from "./codes-beneficiaires";
import { codesGreffes } from "./codes-greffes";

export const libelleFromCodeRoleDirigeant = (codeRole: string) => {
  //@ts-expect-error
  return codeRolesDirigeants[codeRole] || codeRole;
};

export const libelleFromCodeGreffe = (codeGreffe: string) => {
  //@ts-expect-error
  return codesGreffes[codeGreffe] || codeGreffe;
};

export const libelleFromCodeBeneficiaires = (codeBeneficiaires: string) => {
  //@ts-expect-error
  return codesBeneficiaires[codeBeneficiaires] || codeBeneficiaires;
};

export const libelleFromCategoriesJuridiques = (categorie: string) =>
  //@ts-expect-error
  categoriesJuridiques[categorie] || null;

export const libelleFromCodeNatureEntreprise = (code: string) =>
  //@ts-expect-error
  codeNatureEntreprise[code] || null;
