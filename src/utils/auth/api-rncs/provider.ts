import { httpGet } from '../../network';
import { HttpUnauthorizedError } from '../../../http-exceptions';
import { AxiosRequestConfig } from 'axios';
import constants from '../../../constants';
import { APICookie } from './cookie';
import dotenv from 'dotenv';

dotenv.config();

class InpiAPIAuthProvider {
  cookies = [
    new APICookie(process.env.INPI_LOGIN, process.env.INPI_PASSWORD),
    new APICookie(process.env.INPI_LOGIN_2, process.env.INPI_PASSWORD_2),
    new APICookie(process.env.INPI_LOGIN_3, process.env.INPI_PASSWORD_3),
    new APICookie(process.env.INPI_LOGIN_4, process.env.INPI_PASSWORD_4),
    new APICookie(process.env.INPI_LOGIN_5, process.env.INPI_PASSWORD_5),
  ];

  private client = async (
    route: string,
    cookie: string,
    options?: AxiosRequestConfig
  ) => {
    return await httpGet(route, {
      timeout: constants.timeout.S,
      headers: { Cookie: cookie },
      ...options,
    });
  };

  public authenticatedClient = async (
    route: string,
    options?: AxiosRequestConfig
  ) => {
    const index = Math.floor(Math.random() * this.cookies.length);
    try {
      const cookie = await this.cookies[index].get();
      return await this.client(route, cookie, options);
    } catch (e: any) {
      if (e instanceof HttpUnauthorizedError) {
        const cookie = await this.cookies[index].authenticateAndGet();
        return await this.client(route, cookie, options);
      }

      throw e;
    }
  };
}

/**
 * Creates a singleton
 */
const inpiAPIAuth = new InpiAPIAuthProvider();

export default inpiAPIAuth;
