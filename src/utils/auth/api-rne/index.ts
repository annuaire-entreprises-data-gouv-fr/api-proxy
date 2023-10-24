import { AxiosRequestConfig } from 'axios';
import routes from '../../../clients/urls';
import constants from '../../../constants';
import {
  HttpTooManyRequests,
  HttpUnauthorizedError,
} from '../../../http-exceptions';
import httpClient, { httpGet } from '../../network';

let _token = '';

const getToken = async () => {
  const authPairs = [
    {
      username: process.env.RNE_LOGIN,
      password: process.env.RNE_PASSWORD,
    },
    {
      username: process.env.RNE_LOGIN_2,
      password: process.env.RNE_PASSWORD_2,
    },
  ];

  const shuffleIdx = Math.round(Math.random() * (authPairs.length - 1));
  const { username, password } = authPairs[shuffleIdx];

  const response = await httpClient({
    method: 'POST',
    url: routes.inpi.api.rne.login,
    data: {
      username,
      password,
    },
    timeout: constants.timeout.XL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.token;
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
    if (
      e instanceof HttpUnauthorizedError ||
      e instanceof HttpTooManyRequests
    ) {
      _token = await getToken();
      return await callback();
    } else {
      throw e;
    }
  }
};

export { authApiRneClient };
