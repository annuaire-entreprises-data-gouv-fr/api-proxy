import { IImmatriculation } from '../../../models/rne';
import { Siren } from '../../../models/siren-and-siret';
import routes from '../../urls';
import { httpGet } from '../../../utils/network';
import { extractImmatriculationFromHtml } from './html-parser';
import constants from '../../../constants';

export const fetchImmatriculationFromSite = async (
  siren: Siren
): Promise<IImmatriculation> => {
  const response = await httpGet(routes.inpi.portail.entreprise + siren, {
    timeout: constants.timeout.XXXL,
  });

  return {
    siren,
    ...extractImmatriculationFromHtml(response.data, siren),
    observations: [],
    metadata: {
      isFallback: true,
    },
  };
};
