import { IImmatriculation } from '../../../models/rne';
import { Siren } from '../../../models/siren-and-siret';
import routes from '../../urls';
import { httpGet } from '../../../utils/network';
import { extractImmatriculationFromHtml } from './html-parser';
import constants from '../../../constants';

export const fetchImmatriculationFromSite = async (
  siren: Siren
): Promise<IImmatriculation> => {
  const response = await httpGet<string>(
    routes.inpi.portail.entreprise + siren,
    {
      timeout: constants.timeout.XXXXL,
      useCache: false,
    }
  );

  return {
    siren,
    ...extractImmatriculationFromHtml(response, siren),
    metadata: {
      isFallback: true,
    },
  };
};
