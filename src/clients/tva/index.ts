import routes from '../urls';
import { httpGet } from '../../utils/network';
import constants from '../../constants';
import { TVANumber } from '../../models/siren-and-siret';

export const clientTVA = async (tvaNumber: TVANumber): Promise<string> => {
  const url = `${routes.tva}${tvaNumber}`;
  return await httpGet(url, { timeout: constants.timeout.XXL, useCache: true });
};
