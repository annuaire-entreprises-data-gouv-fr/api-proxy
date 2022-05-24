import { AxiosRequestConfig } from 'axios';
import constants from '../../../constants';
import { httpGet } from '../../network';
import inpiSiteAuth from './provider';

const authenticatedSiteClient = async (
  url: string,
  config?: AxiosRequestConfig
) => {
  const cookies = await inpiSiteAuth.getCookies();
  const response = await httpGet(url, {
    headers: {
      Cookie: cookies || '',
    },
    responseType: 'arraybuffer',
    timeout: constants.defaultTimeout,
    ...config,
  });
  const { data } = response;
  if (!data) {
    throw new Error('response is empty');
  }
  return data;
};

export default authenticatedSiteClient;
