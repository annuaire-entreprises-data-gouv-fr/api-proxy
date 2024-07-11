<h1 align="center">
  <img src="https://github.com/annuaire-entreprises-data-gouv-fr/site/blob/main/public/images/annnuaire-entreprises.svg" width="400px" />
</h1>

<a href="https://github.com/annuaire-entreprises-data-gouv-fr/api-proxy/blob/main/LICENSE"><img src="https://img.shields.io/github/license/etalab/annuaire-entreprises-api-proxy.svg?color=green" alt="License Badge"></a>
[![Pre-merge checks](https://github.com/annuaire-entreprises-data-gouv-fr/api-proxy/actions/workflows/pre-merge.yml/badge.svg)](https://github.com/annuaire-entreprises-data-gouv-fr/api-proxy/actions/workflows/pre-merge.yml)
[![Deploy](https://github.com/annuaire-entreprises-data-gouv-fr/api-proxy/actions/workflows/deploy.yml/badge.svg)](https://github.com/annuaire-entreprises-data-gouv-fr/api-proxy/actions/workflows/deploy.yml)

Bienvenue sur le dépôt API Proxy du projet [Annuaire des Entreprises](https://annuaire-entreprises.data.gouv.fr).

## Architecture du service 🏗

Ce repository fait partie [d'un ensemble de services qui constituent l'Annuaire des Entreprises](https://github.com/annuaire-entreprises-data-gouv-fr/site?tab=readme-ov-file#dépôts-liés-).

## Installation

```bash
# Installation
npm i

# Lancer le site en dev
npm run dev

# Lancer le site en prod
npm run build && npm run start

```

## Utilisation

L’API est protégée en appel par un header `X-API-Key`

Une fois doté de ce header vous pouvez appeler les routes suivantes :

```

// create a PDF download job
https://rncs-proxy.api.gouv.fr/document/justificatif/job/:siren
https://rncs-proxy.api.gouv.fr/document/justificatif/job/status

// download an existing file with the slug given on job creation
https://rncs-proxy.api.gouv.fr/document/downloads/:slug

// status
https://rncs-proxy.api.gouv.fr/status/imr/api
https://rncs-proxy.api.gouv.fr/status/imr/site
```

### Tests

1. Linter

```bash
npm run lint
```

2. Tests unitaires

```bash
npm run test
```

### Deploiement

Le déploiement se fait par [Github action](https://github.com/annuaire-entreprises-data-gouv-fr/api-proxy/actions)

A chaque "merge" sur master :

- Laissez le déploiement se faire automatiquement sur staging via l'action [deploy-staging](https://github.com/annuaire-entreprises-data-gouv-fr/api-proxy/actions/workflows/deploy-staging.yml)
- Vérifiez vos changements sur staging
- Lancez manuellement le déploiement sur la production : sur [deploy-production](https://github.com/annuaire-entreprises-data-gouv-fr/api-proxy/actions/workflows/deploy-production.yml) et cliquez sur "Run workflow" -> "Run workflow"

NB: Si plusieurs déploiements sont déclenchés en même temps, seul le premier va jusqu'au bout. Les autres sont automatiquement interrompus.

## Licence

Ce projet est sous AGPL 3.0
