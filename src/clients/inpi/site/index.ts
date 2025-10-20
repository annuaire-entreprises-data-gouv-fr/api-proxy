import constants from "../../../constants";
import type { IObservation } from "../../../models/rne";
import type { Siren } from "../../../models/siren-and-siret";
import { httpGet } from "../../../utils/network";
import routes from "../../urls";
import { extractObservationsFromHtml } from "./html-parser";

export const fetchObservationsFromSite = async (
  siren: Siren
): Promise<IObservation[]> => {
  const encodedSiren = encodeURIComponent(siren);
  const url = `${routes.inpi.portail.entreprise}${encodedSiren}`;

  const response = await httpGet<string>(url, {
    timeout: constants.timeout.XXXXL,
    useCache: false,
  });

  return extractObservationsFromHtml(response, siren);
};
