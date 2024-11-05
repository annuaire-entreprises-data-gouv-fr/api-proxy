import routes from '../urls';
import { httpGet } from '../../utils/network';
import constants from '../../constants';

export const clientAssociation = async (rna: string): Promise<string> => {
  const url = `${routes.association}${rna}`;
  return await httpGet<any>(url, {
    timeout: constants.timeout.L,
    useCache: true,
  });
};
