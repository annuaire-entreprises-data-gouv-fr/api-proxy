import constants from '../../../constants';
import { actesApiRneClient } from '../../../utils/auth/api-rne';
import routes from '../../urls';

export const downloadActeRne = async (id: string) => {
  const url = `${routes.inpi.api.rne.download.acte}${id}/download`;
  return await actesApiRneClient.get<any>(url, {
    timeout: constants.timeout.XXXL,
    responseType: 'arraybuffer',
  });
};

export const downloadBilanRne = async (id: string) => {
  const url = `${routes.inpi.api.rne.download.bilan}${id}/download`;
  return await actesApiRneClient.get<any>(url, {
    timeout: constants.timeout.XXXL,
    responseType: 'arraybuffer',
  });
};
