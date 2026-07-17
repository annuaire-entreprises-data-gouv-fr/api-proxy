import constants from "../../../constants";
import type { Siren } from "../../../models/siren-and-siret";
import routes from "../../urls";
import { defaultApiRneClient } from "./auth";
import type { IRNEResponse } from "./interface";

export const fetchImmatriculationDateFromAPIRNE = async (
  siren: Siren,
  useCache = true,
  signal?: AbortSignal
) => {
  const data = await defaultApiRneClient.get<IRNEResponse>(
    routes.inpi.api.rne.cmc.companies + siren,
    { timeout: constants.timeout.XXXL, useCache },
    signal
  );

  return { dateMiseAJourInpi: data.updatedAt };
};
