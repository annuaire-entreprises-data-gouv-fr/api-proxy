const routes = {
  eori: "https://ec.europa.eu/taxation_customs/dds2/eos/validation/services/validation",
  ig: "https://www.api.infogreffe.fr/athena/detail-entreprises/detail_entreprises?numero_identification=",
  inpi: {
    api: {
      rne: {
        cmc: {
          companies:
            "https://registre-national-entreprises.inpi.fr/api/companies/",
        },
        download: {
          acte: "https://registre-national-entreprises.inpi.fr/api/actes/",
          bilan: "https://registre-national-entreprises.inpi.fr/api/bilans/",
        },
        login: "https://registre-national-entreprises.inpi.fr/api/sso/login",
      },
    },
    portail: {
      any: "https://data.inpi.fr/entreprises/409716305",
      entreprise: "https://data.inpi.fr/entreprises/",
      login: "https://data.inpi.fr/login",
      pdf: "https://data.inpi.fr/export/companies",
    },
  },
  tooling: {
    grist: "https://grist.numerique.gouv.fr/api/docs/",
  },
};

export default routes;
