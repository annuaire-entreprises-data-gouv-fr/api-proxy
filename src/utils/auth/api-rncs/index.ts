import { AxiosRequestConfig } from 'axios';
import inpiAPIAuth from './provider';

const authApiRncsClient = async (
  route: string,
  options?: AxiosRequestConfig
) => {
  return await inpiAPIAuth.authenticatedClient(route, options);
};

export { authApiRncsClient };
