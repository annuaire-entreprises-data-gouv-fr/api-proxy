import constants from "../../constants";
import { HttpBadRequestError, HttpLockedError } from "../../http-exceptions";
import type { TVANumber } from "../../models/siren-and-siret";
import { httpGet } from "../../utils/network";
import { getOrSetWithCacheExpiry } from "../../utils/network/storage/smart-cache-storage";
import routes from "../urls";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const clientTVA = (
  tvaNumber: TVANumber,
  noCache = false
): Promise<{ tva: string | null }> => {
  const encodedTvaNumber = encodeURIComponent(tvaNumber);
  const url = `${routes.tva}${encodedTvaNumber}`;

  const callback = () =>
    httpGet<{ userError: string; isValid: boolean; vatNumber?: string }>(url, {
      timeout: constants.timeout.XXL,
      useCache: false,
    }).then((res) => {
      if (res.userError === "MS_MAX_CONCURRENT_REQ") {
        throw new HttpLockedError(res.userError);
      }
      if (!["VALID", "INVALID"].includes(res.userError)) {
        throw new HttpBadRequestError(res.userError);
      }

      return { tva: res.isValid ? (res.vatNumber ?? null) : null };
    });

  return noCache
    ? callback()
    : getOrSetWithCacheExpiry(
        `tva:${tvaNumber}`,
        callback,
        ONE_MONTH_MS,
        ONE_WEEK_MS
      );
};
