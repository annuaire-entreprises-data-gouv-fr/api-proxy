import constants from "../../constants";
import type { TVANumber } from "../../models/siren-and-siret";
import { httpGet } from "../../utils/network";
import routes from "../urls";

export const clientTVA = async (tvaNumber: TVANumber): Promise<string> => {
  const encodedTvaNumber = encodeURIComponent(tvaNumber);
  const url = `${routes.tva}${encodedTvaNumber}`;

  return await httpGet(url, { timeout: constants.timeout.XXL, useCache: true });
};
