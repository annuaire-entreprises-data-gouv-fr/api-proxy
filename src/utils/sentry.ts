import * as Sentry from '@sentry/node';

export interface IScope {
  page?: string;
  siret?: string;
  siren?: string;
  details?: string;
  referrer?: string;
  browser?: string;
}

// scope allows to log stuff in tags in sentry
const getScope = (extra: IScope) => {
  const scope = new Sentry.Scope();
  Object.keys(extra).forEach((key) => {
    //@ts-ignore
    scope.setTag(key, extra[key] || 'N/A');
  });
  return scope;
};

export const logWarningInSentry = (errorMsg: any, extra?: IScope) => {
  const shouldLogInSentry =
    process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN && Sentry;

  if (shouldLogInSentry) {
    const scope = getScope(extra || {});
    scope.setLevel(Sentry.Severity.Info);

    if (typeof errorMsg === 'string') {
      Sentry.captureMessage(errorMsg, scope);
    } else {
      Sentry.captureException(errorMsg, scope);
    }
  } else {
    console.log(errorMsg, JSON.stringify(extra || {}));
  }
};
