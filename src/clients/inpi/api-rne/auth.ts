import dotenv from "dotenv";
import constants from "../../../constants";
import {
  HttpTooManyRequests,
  HttpUnauthorizedError,
} from "../../../http-exceptions";
import httpClient, {
  httpGet,
  type IDefaultRequestConfig,
} from "../../../utils/network";
import routes from "../../urls";

dotenv.config();

class RNEClient {
  private _token = "";
  private readonly account = [process.env.RNE_LOGIN, process.env.RNE_PASSWORD];

  refreshToken = async () => {
    const [username, password] = this.account;

    const response = await httpClient<{ token: string }>({
      method: "POST",
      url: routes.inpi.api.rne.login,
      data: {
        username,
        password,
      },
      timeout: constants.timeout.XXL,
      useCache: false,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.token;
  };

  get = async <T>(
    route: string,
    options?: IDefaultRequestConfig,
    signal?: AbortSignal
  ): Promise<T> => {
    const callback = () =>
      httpGet<T>(route, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${this._token}`,
        },
        useCache: !!options?.useCache,
        signal,
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
        this._token = await this.refreshToken();
        return await callback();
      }
      throw e;
    }
  };
}

const defaultApiRneClient = new RNEClient();

export { defaultApiRneClient };
