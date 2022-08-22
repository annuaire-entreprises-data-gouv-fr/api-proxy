import routes from '../../../clients/urls';
import { logWarningInSentry } from '../../sentry';
import getPuppeteerBrowser from './browser';

const EXPIRY_TIME = 10 * 60 * 1000;

export class InpiSiteCookiesProvider {
  _cookies = '';
  _refreshing = false;
  _lastRefresh = 0;

  async getCookies() {
    const isCookieOutdated =
      this._lastRefresh + EXPIRY_TIME < new Date().getTime();

    if (!this._cookies || isCookieOutdated) {
      await this.refreshCookies();
    }

    return this._cookies;
  }

  async refreshCookies() {
    if (this._refreshing) {
      // abort as refresh is already on-going
      return;
    }

    this._refreshing = true;
    try {
      logWarningInSentry('InpiSiteAuthProvider: cookie refresh initiated');

      const browser = await getPuppeteerBrowser();
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36'
      );

      const login = process.env.INPI_SITE_LOGIN || '';
      const passwd = process.env.INPI_SITE_PASSWORD || '';

      await page.goto(routes.rncs.portail.login);
      await page.type('#login_form_Email', login);
      await page.type('#login_form_password', passwd);

      await page.waitForSelector('input#login_form_licence');
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
    } finally {
      this._refreshing = false;
    }
  }

  isRefreshing() {
    return this._refreshing;
  }
}

const inpiSiteCookies = [
  new InpiSiteCookiesProvider(),
  new InpiSiteCookiesProvider(),
  new InpiSiteCookiesProvider(),
  new InpiSiteCookiesProvider(),
  new InpiSiteCookiesProvider(),
  new InpiSiteCookiesProvider(),
  new InpiSiteCookiesProvider(),
];

const getRandomInpiSiteCookieProvider = () => {
  // select only live cookies
  let liveCookies = inpiSiteCookies.filter(
    (provider) => !provider.isRefreshing()
  );

  // in case all cookies are refreshing, we dont filter
  if (liveCookies.length === 0) {
    liveCookies = inpiSiteCookies;
  }

  // math.random is in [0, 1[ so random index will be in [0, inpiSiteCookies.length[
  const randomIndex = Math.floor(Math.random() * liveCookies.length);
  return liveCookies[randomIndex];
};

export default getRandomInpiSiteCookieProvider;
