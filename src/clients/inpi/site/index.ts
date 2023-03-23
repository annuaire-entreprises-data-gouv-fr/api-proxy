import { IImmatriculation } from '../../../models/imr';
import { Siren } from '../../../models/siren-and-siret';
import routes from '../../urls';
import { httpGet } from '../../../utils/network';
import { extractIMRFromHtml } from './IMR-parser';
import constants from '../../../constants';

export const fetchImmatriculationFromSite = async (
  siren: Siren
): Promise<IImmatriculation> => {
  const response = await httpGet(routes.inpi.portail.entreprise + siren, {
    timeout: constants.timeout.L,
  });

  return {
    siren,
    ...extractIMRFromHtml(response.data, siren),
    observations: [],
    metadata: {
      isFallback: true,
    },
  };
};
