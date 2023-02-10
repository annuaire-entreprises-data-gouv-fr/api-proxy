const routes = {
  association: 'https://siva-integ1.cegedim.cloud/apim/api-asso/api/structure/',
  inpi: {
    portail: {
      entreprise: 'https://data.inpi.fr/entreprises/',
      any: 'https://data.inpi.fr/entreprises/409716305',
      login: 'https://data.inpi.fr/login',
      pdf: 'https://data.inpi.fr/export/companies',
    },
    api: {
      rncs: {
        login: 'https://opendata-rncs.inpi.fr/services/diffusion/login',
        imr: {
          find: 'https://opendata-rncs.inpi.fr/services/diffusion/imrs-saisis/find?siren=',
          get: 'https://opendata-rncs.inpi.fr/services/diffusion/imrs-saisis/get?listeSirens=',
        },
      },
      rne: {
        login: 'https://registre-national-entreprises.inpi.fr/api/sso/login',
        cmc: {
          companies:
            'https://registre-national-entreprises.inpi.fr/api/companies/',
        },
      },
    },
  },
};

export default routes;
