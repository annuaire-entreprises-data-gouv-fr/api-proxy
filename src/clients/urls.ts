const routes = {
  rncs: {
    portail: {
      entreprise: 'https://data.inpi.fr/entreprises/',
      any: 'https://data.inpi.fr/entreprises/409716305',
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
  association: 'https://siva-integ1.cegedim.cloud/apim/api-asso/api/structure/',
};

export default routes;
