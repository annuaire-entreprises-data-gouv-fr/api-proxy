export interface IInpiSiteCookies {
  phpSessionId: string;
}

const extractCookies = (sessionCookies: any): IInpiSiteCookies => {
  if (!sessionCookies || typeof sessionCookies !== 'string') {
    throw new Error('Invalid session cookies');
  }

  const phpSessionSearch = RegExp(/(PHPSESSID=)([^;]*)/, 'g');

  const phpSessionIdMatch = phpSessionSearch.exec(sessionCookies);

  const phpSessionId = phpSessionIdMatch ? phpSessionIdMatch[2] : null;

  if (phpSessionId === null) {
    throw new Error('Could not parse session cookies');
  }

  return {
    phpSessionId,
  };
};

const extractAuthSuccessFromHtmlForm = (html: string) => {
  return html.indexOf('Xavier') > -1;
};

const loginFormData = () => {
  const login = process.env.INPI_SITE_LOGIN as string;
  const password = process.env.INPI_SITE_PASSWORD as string;

  return `referer=https%3A%2F%2Fdata.inpi.fr%2Flogin&login_form%5BEmail%5D=${login}&login_form%5Bpassword%5D=${password}&login_form%5Blicence%5D=1&login_form%5Bsubmit%5D=`;
};

export { extractAuthSuccessFromHtmlForm, extractCookies, loginFormData };
