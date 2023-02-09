import routes from '../urls';
import { httpGet } from '../../utils/network';
import constants from '../../constants';

export const clientAssociation = async (rna: string): Promise<string> => {
  const url = `${routes.association}${rna}`;
  const response = await httpGet(url, { timeout: constants.defaultTimeout });
  const { data } = response;
  return data;
};
