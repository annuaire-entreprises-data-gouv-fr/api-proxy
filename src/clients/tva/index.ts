import routes from '../urls';
import { httpGet } from '../../utils/network';
import constants from '../../constants';

export const clientTVAVies = async (slug: string): Promise<string> => {
  const url = `${routes.tva}${slug}`;
  const response = await httpGet(url, { timeout: constants.timeout.XXL });
  const { data } = response;
  return data;
};
