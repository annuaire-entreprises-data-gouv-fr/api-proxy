import routes from '../urls';
import { httpGet } from '../../utils/network';
import constants from '../../constants';
import { TVANumber } from '../../models/siren-and-siret';

export const clientTVA = async (tvaNumber: TVANumber): Promise<string> => {
  const url = `${routes.tva}${tvaNumber}`;
  const response = await httpGet(url, { timeout: constants.timeout.L });
  const { data } = response;
  return data;
};
