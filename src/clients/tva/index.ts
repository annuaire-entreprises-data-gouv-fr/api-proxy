import constants from "../../constants";
import type { TVANumber } from "../../models/siren-and-siret";
import { httpGet } from "../../utils/network";
import { getOrSetWithCacheExpiry } from "../../utils/network/storage/smart-cache-storage";
import routes from "../urls";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const clientTVA = (tvaNumber: TVANumber): Promise<string> => {
  const encodedTvaNumber = encodeURIComponent(tvaNumber);
  const url = `${routes.tva}${encodedTvaNumber}`;

  const callback = () =>
    httpGet<{ userError: string; isValid: boolean; vatNumber?: string }>(url, {
      timeout: constants.timeout.XXL,
      useCache: false,
    }).then((res) => {
      if (!["VALID", "INVALID"].includes(res.userError)) {
        throw new Error(res.userError);
      }

      return { tva: res.isValid ? (res.vatNumber ?? null) : null };
    });

  return getOrSetWithCacheExpiry(
    `tva:${tvaNumber}`,
    callback,
    ONE_MONTH_MS,
    ONE_WEEK_MS
  );
};
