import constants from '../../../constants';
import { authApiRneClient } from '../../../utils/auth/api-rne';
import routes from '../../urls';

export const downloadActeRne = async (id: string) => {
  const url = `${routes.inpi.api.rne.actes.download}${id}/download`;
  return await authApiRneClient(url, {
    timeout: constants.timeout.XXXL,
    responseType: 'arraybuffer',
  });
};
