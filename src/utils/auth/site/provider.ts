import routes from '../../../clients/urls';
import { logWarningInSentry } from '../../sentry';
import getPuppeteerBrowser from './browser';

const DEFAULT_REFRESH = 2 * 60 * 60 * 1000;
const RETRY_REFRESH = 20 * 60 * 1000;

class InpiSiteCookiesProvider {
  _cookies = '';
  _init = false;
  _lastRefresh = 0;

  async getCookies() {
    if (!this._init) {
      // start refresh loop
      // this.refreshCookies();
      this._init = true;
    }

    return this._cookies;
  }

  async refreshCookies() {
    const browser = await getPuppeteerBrowser();
    const page = await browser.newPage();
    let nextRefresh = DEFAULT_REFRESH;

    try {
      logWarningInSentry('InpiSiteAuthProvider: cookie refresh initiated');

      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36'
      );

      const login = process.env.INPI_SITE_LOGIN || '';
      const passwd = process.env.INPI_SITE_PASSWORD || '';

      await page.goto(routes.rncs.portail.login, { timeout: 5000 });
      await page.type('#login_form_Email', login);
      await page.type('#login_form_password', passwd);

      await page.waitForSelector('input#login_form_licence', { timeout: 5000 });
      await page.evaluate(() => {
        document.getElementById('login_form_licence')?.click();
        document.getElementById('login_form_submit')?.click();
      });

      let success = false;
      try {
        await page.waitForSelector('.alert.alert-success', { timeout: 5000 });
        success = true;
      } catch {
        throw new Error('login on data.inpi.fr failed');
      }

      if (success) {
        const cookiesFromPuppeteer = await page.cookies();
        this._cookies = cookiesFromPuppeteer
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; ');
      }
      this._lastRefresh = new Date().getTime();
    } catch (error: any) {
      console.log(error);
      logWarningInSentry('InpiSiteAuthProvider: cookie refresh failed', {
        details: error.toString(),
      });

      // refresh failed so we retry refresh sooner
      nextRefresh = RETRY_REFRESH;
    } finally {
      setTimeout(() => this.refreshCookies(), nextRefresh);
      await page.close();
    }
  }
}

const inpiSiteCookies = new InpiSiteCookiesProvider();

export default inpiSiteCookies;
