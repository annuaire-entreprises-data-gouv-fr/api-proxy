const routes = {
  tva: "https://ec.europa.eu/taxation_customs/vies/rest-api/ms/FR/vat/",
  eori: "https://ec.europa.eu/taxation_customs/dds2/eos/validation/services/validation",
  ig: "https://www.api.infogreffe.fr/athena/detail-entreprises/detail_entreprises?numero_identification=",
  inpi: {
    portail: {
      entreprise: "https://data.inpi.fr/entreprises/",
      any: "https://data.inpi.fr/entreprises/409716305",
      login: "https://data.inpi.fr/login",
      pdf: "https://data.inpi.fr/export/companies",
    },
    api: {
      rne: {
        login: "https://registre-national-entreprises.inpi.fr/api/sso/login",
        cmc: {
          companies:
            "https://registre-national-entreprises.inpi.fr/api/companies/",
        },
        download: {
          bilan: "https://registre-national-entreprises.inpi.fr/api/bilans/",
          acte: "https://registre-national-entreprises.inpi.fr/api/actes/",
        },
      },
    },
  },
  tooling: {
    grist: "https://grist.numerique.gouv.fr/api/docs/",
  },
};

export default routes;
