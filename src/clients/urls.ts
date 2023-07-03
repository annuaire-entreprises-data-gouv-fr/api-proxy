const routes = {
  association: 'https://siva-integ1.cegedim.cloud/apim/api-asso/api/structure/',
  tva: 'https://ec.europa.eu/taxation_customs/vies/rest-api/ms/FR/vat/',
  inpi: {
    portail: {
      entreprise: 'https://data.inpi.fr/entreprises/',
      any: 'https://data.inpi.fr/entreprises/409716305',
      login: 'https://data.inpi.fr/login',
      pdf: 'https://data.inpi.fr/export/companies',
    },
    api: {
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
