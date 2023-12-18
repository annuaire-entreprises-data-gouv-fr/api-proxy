import routes from '../urls';
import { httpGet } from '../../utils/network';
import constants from '../../constants';

export const clientTVA = async (rna: string): Promise<string> => {
  const url = `${routes.tva}${rna}`;
  const response = await httpGet(url, { timeout: constants.timeout.L });
  const { data } = response;
  return data;
};
