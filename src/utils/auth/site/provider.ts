import routes from '../../../clients/urls';
import constants from '../../../constants';
import httpClient, { httpGet } from '../../network';
import { logWarningInSentry } from '../../sentry';
import {
  extractCookies,
  IInpiSiteCookies,
  extractAuthSuccessFromHtmlForm,
  loginFormData,
} from './helpers';

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
  Accept: '*/*',
  Referer: 'https://data.inpi.fr',
};

const COOKIE_VALIDITY_TIME = 60 * 60 * 1000;
const COOKIE_OUTDATED_RETRY_TIME = 5 * 60 * 1000;

interface IAuth {
  cookies: IInpiSiteCookies | null;
  lastSuccessfullAuth: number;
}
const authData: IAuth = {
  cookies: null,
  lastSuccessfullAuth: 0,
};

class InpiSiteAuthProvider {
  _initialized = false;

  async init() {
    this._initialized = true;
    await this.refreshCookies();
  }

  async getCookies() {
    if (!this._initialized) {
      await this.init();
    }
    return authData.cookies ? this.formatCookies(authData.cookies) : null;
  }

  async refreshCookies(): Promise<void> {
    try {
      logWarningInSentry('InpiSiteAuthProvider: cookie refresh initiated', {});

      const newCookies = await this.getInitialCookies();

      // wait 500 ms
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

      await this.authenticateCookies(newCookies);
      this.setCookies(newCookies);
      setTimeout(() => this.refreshCookies(), COOKIE_VALIDITY_TIME);
    } catch (e: any) {
      logWarningInSentry('InpiSiteAuthProvider: cookie refresh failed', {
        details: e.toString(),
      });
      setTimeout(() => this.refreshCookies(), COOKIE_OUTDATED_RETRY_TIME);
    }
  }

  /**
   * First call. Caller get two session cookies and a token in the login form
   * */
  async getInitialCookies(): Promise<IInpiSiteCookies> {
    // call any page to get session cookies
    const response = await httpGet(routes.rncs.portail.any, {
      headers: DEFAULT_HEADERS,
      timeout: constants.pdfTimeout,
    });
    const sessionCookies = (response.headers['set-cookie'] || []).join(' ');

    return extractCookies(sessionCookies);
  }

  /**
   * POST the form to validate the cookies
   */
  async authenticateCookies(cookies: IInpiSiteCookies) {
    const cookieString = this.formatCookies(cookies);
    if (!cookieString) {
      throw new Error('trying to authenticate empty cookies or token');
    }

    const response = await httpClient({
      url: routes.rncs.portail.login,
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: 'https://data.inpi.fr',
        Cookie: cookieString,
      },
      data: loginFormData(),
      timeout: constants.pdfTimeout,
    });

    const html = response.data;
    const loginSuccess = extractAuthSuccessFromHtmlForm(html);

    if (!loginSuccess) {
      throw new Error('INPI response does not contain success alert');
    }
  }

  formatCookies = (cookies: IInpiSiteCookies) => {
    if (!cookies) {
      return null;
    }
    return `PHPSESSID=${cookies.phpSessionId}`;
  };

  setCookies(newCookies: IInpiSiteCookies) {
    authData.lastSuccessfullAuth = new Date().getTime();
    authData.cookies = newCookies;
  }
}

/**
 * Create a singleton
 */
const inpiSiteAuth = new InpiSiteAuthProvider();

export default inpiSiteAuth;
