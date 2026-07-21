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
  console.log(
    "fetchImmatriculationDateFromAPIRNE",
    siren,
    useCache,
    signal,
    routes.inpi.api.rne.cmc.companies + siren
  );
  const data = await defaultApiRneClient.get<IRNEResponse>(
    routes.inpi.api.rne.cmc.companies + siren,
    { timeout: constants.timeout.XXXL, useCache },
    signal
  );

  console.log(" =====> fetchImmatriculationDateFromAPIRNE data", data);

  return { dateMiseAJourInpi: data.updatedAt };
};
