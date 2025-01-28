import routes from '../../../clients/urls';
import constants from '../../../constants';
import {
  HttpTooManyRequests,
  HttpUnauthorizedError,
} from '../../../http-exceptions';
import httpClient, { httpGet, IDefaultRequestConfig } from '../../network';
import { logWarningInSentry } from '../../sentry';
import dotenv from 'dotenv';

dotenv.config();

enum ECredentialType {
  DEFAULT,
  ACTES,
}

class RNEClient {
  private _token = '';
  private _currentAccountIndex = 0;
  private accounts;

  constructor(credentialType = ECredentialType.DEFAULT) {
    this.accounts =
      credentialType === ECredentialType.ACTES
        ? [
            // [process.env.RNE_LOGIN_ACTES_1, process.env.RNE_PASSWORD_ACTES_1],
            [process.env.RNE_LOGIN_ACTES_2, process.env.RNE_PASSWORD_ACTES_2],
          ]
        : [
            [process.env.RNE_LOGIN, process.env.RNE_PASSWORD],
            [process.env.RNE_LOGIN_2, process.env.RNE_PASSWORD_2],
            [process.env.RNE_LOGIN_3, process.env.RNE_PASSWORD_3],
            [process.env.RNE_LOGIN_4, process.env.RNE_PASSWORD_4],
          ];
  }

  refreshToken = async (shouldRotateAccount = false, e = {}) => {
    if (shouldRotateAccount) {
      this._currentAccountIndex =
        (this._currentAccountIndex + 1) % this.accounts.length;

      logWarningInSentry('Rotating RNE account', {
        details: `new pair : ${this._currentAccountIndex}, cause : ${e}`,
      });
    }

    const [username, password] = this.accounts[this._currentAccountIndex];

    const response = await httpClient<{ token: string }>({
      method: 'POST',
      url: routes.inpi.api.rne.login,
      data: {
        username,
        password,
      },
      timeout: constants.timeout.XXL,
      useCache: false,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.token;
  };

  get = async <T>(
    route: string,
    options?: IDefaultRequestConfig
  ): Promise<T> => {
    const callback = () =>
      httpGet<T>(route, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${this._token}`,
        },
        useCache: !!options?.useCache,
      });

    try {
      if (!this._token) {
        this._token = await this.refreshToken();
      }
      return await callback();
    } catch (e: any) {
      /**
       * Either INPI returns too many requests or unauthorized
       *
       * Unauthorized can either be
       * - token needs to be refresh
       * - account is blocked
       *
       * In both case rotating account is safer
       */
      if (
        e instanceof HttpTooManyRequests ||
        e instanceof HttpUnauthorizedError
      ) {
        const shouldRotateAccount = true;
        this._token = await this.refreshToken(shouldRotateAccount, e);
        return await callback();
      } else {
        throw e;
      }
    }
  };
}

const defaultApiRneClient = new RNEClient(ECredentialType.DEFAULT);
const actesApiRneClient = new RNEClient(ECredentialType.ACTES);

export { defaultApiRneClient, actesApiRneClient };
