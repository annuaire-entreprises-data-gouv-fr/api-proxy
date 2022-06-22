const routes = {
  rncs: {
    portail: {
      entreprise: 'https://data.inpi.fr/entreprises/',
      login: 'https://data.inpi.fr/login',
      pdf: 'https://data.inpi.fr/export/companies',
    },
    api: {
      login: 'https://opendata-rncs.inpi.fr/services/diffusion/login',
      imr: {
        find: 'https://opendata-rncs.inpi.fr/services/diffusion/imrs-saisis/find?siren=',
        get: 'https://opendata-rncs.inpi.fr/services/diffusion/imrs-saisis/get?listeSirens=',
      },
    },
  },
};

export default routes;
