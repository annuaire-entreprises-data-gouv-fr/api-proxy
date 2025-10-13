import constants from "../../constants";
import { httpGet } from "../../utils/network";
import routes from "../urls";

export const clientAssociation = async (rna: string): Promise<string> => {
  const encodedRna = encodeURIComponent(rna);
  const url = `${routes.association}${encodedRna}`;

  return await httpGet<any>(url, {
    timeout: constants.timeout.XL,
    useCache: true,
  });
};
