import { AxiosRequestConfig } from 'axios';
import routes from '../../../clients/urls';
import { HttpUnauthorizedError } from '../../../http-exceptions';
import httpClient, { httpGet } from '../../network';

let _token = '';

const getToken = async () => {
  try {
    const response = await httpClient({
      method: 'POST',
      url: routes.api.rne.login,
      data: {
        username: process.env.RNE_LOGIN,
        password: process.env.RNE_LOGIN,
      },
    });
    return response.data.token;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const authApiRneClient = async (
  route: string,
  options?: AxiosRequestConfig
) => {
  const callback = () =>
    httpGet(route, {
      ...options,
      headers: { ...options?.headers, Authorization: `Bearer ${_token}` },
    });

  try {
    if (!_token) {
      _token = await getToken();
    }
    return await callback();
  } catch (e: any) {
    if (e instanceof HttpUnauthorizedError) {
      _token = await getToken();
      return await callback();
    } else {
      throw e;
    }
  }
};

export { authApiRneClient };
