import { AxiosRequestConfig } from 'axios';
import routes from '../../../clients/urls';
import constants from '../../../constants';
import {
  HttpTooManyRequests,
  HttpUnauthorizedError,
} from '../../../http-exceptions';
import httpClient, { httpGet } from '../../network';
import { logWarningInSentry } from '../../sentry';

let _token = '';
let _currentAccountIndex = 0;

const refreshToken = async (shouldRotateAccount = false) => {
  const accounts = [
    {
      username: process.env.RNE_LOGIN,
      password: process.env.RNE_PASSWORD,
    },
    {
      username: process.env.RNE_LOGIN_2,
      password: process.env.RNE_PASSWORD_2,
    },
    {
      username: process.env.RNE_LOGIN_3,
      password: process.env.RNE_PASSWORD_3,
    },
    {
      username: process.env.RNE_LOGIN_4,
      password: process.env.RNE_PASSWORD_4,
    },
    {
      username: process.env.RNE_LOGIN_5,
      password: process.env.RNE_PASSWORD_5,
    },
  ];

  if (shouldRotateAccount) {
    _currentAccountIndex = (_currentAccountIndex + 1) % accounts.length;

    logWarningInSentry('Rotating RNE account');
  }

  const { username, password } = accounts[_currentAccountIndex];

  const response = await httpClient({
    method: 'POST',
    url: routes.inpi.api.rne.login,
    data: {
      username,
      password,
    },
    timeout: constants.timeout.XXL,
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
      _token = await refreshToken();
    }
    return await callback();
  } catch (e: any) {
    console.log(e);
    if (e instanceof HttpTooManyRequests) {
      const shouldRotateAccount = true;
      _token = await refreshToken(shouldRotateAccount);
    }
    if (e instanceof HttpUnauthorizedError) {
      _token = await refreshToken();
      return await callback();
    } else {
      throw e;
    }
  }
};

export { authApiRneClient };
