import constants from '../../../constants';
import { IImmatriculation } from '../../../models/rne';
import { Siren } from '../../../models/siren-and-siret';
import { httpGet } from '../../../utils/network';
import routes from '../../urls';
import { extractImmatriculationFromHtml } from './html-parser';

export const fetchImmatriculationFromSite = async (
  siren: Siren
): Promise<IImmatriculation> => {
  const encodedSiren = encodeURIComponent(siren);
  const url = `${routes.inpi.portail.entreprise}${encodedSiren}`;

  const response = await httpGet<string>(url, {
    timeout: constants.timeout.XXXXL,
    useCache: false,
  });

  return {
    siren,
    ...extractImmatriculationFromHtml(response, siren),
    metadata: {
      isFallback: true,
    },
  };
};
