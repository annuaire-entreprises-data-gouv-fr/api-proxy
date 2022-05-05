import { AxiosRequestConfig } from 'axios';
import inpiAPIAuth from './provider';

const authApiClient = async (
  route: string,
  options?: AxiosRequestConfig,
  withCache = true
) => {
  return await inpiAPIAuth.authenticatedClient(route, options, withCache);
};

export { authApiClient };
