const routes = {
  association: 'https://siva-integ1.cegedim.cloud/apim/api-asso/api/structure/',
  tva: 'https://ec.europa.eu/taxation_customs/vies/rest-api/ms/FR/vat/',
  eori: 'https://ec.europa.eu/taxation_customs/dds2/eos/validation/services/validation',
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
        download: {
          bilan: 'https://registre-national-entreprises.inpi.fr/api/bilans/',
          acte: 'https://registre-national-entreprises.inpi.fr/api/actes/',
        },
      },
    },
  },
};

export default routes;
