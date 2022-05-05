import { AxiosRequestConfig } from 'axios';
import inpiAPIAuth from './provider';

const authApiClient = async (route: string, options?: AxiosRequestConfig) => {
  return await inpiAPIAuth.authenticatedClient(route, options);
};

export { authApiClient };
