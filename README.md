# Proxy API

[![Pre-merge checks](https://github.com/etalab/annuaire-entreprises-api-proxy/actions/workflows/pre-merge.yml/badge.svg)](https://github.com/etalab/annuaire-entreprises-api-proxy/actions/workflows/pre-merge.yml)
[![Deploy - Staging](https://github.com/etalab/annuaire-entreprises-api-proxy/actions/workflows/deploy-staging.yml/badge.svg)](https://github.com/etalab/annuaire-entreprises-api-proxy/actions/workflows/deploy-staging.yml)
[![Deploy - Production](https://github.com/etalab/annuaire-entreprises-api-proxy/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/etalab/annuaire-entreprises-proxy/actions/workflows/deploy-production.yml)

Ce proxy permet de proxifier certains appels a des API utilisées par l'Annuaire des Entreprises.

## Architecture du service 🏗

Ce repository fait partie d'un ensemble de services qui constituent l'[Annuaire des Entreprises](https://annuaire-entreprises.data.gouv.fr) :

| Description                    | Accès                                                                     |
| ------------------------------ | ------------------------------------------------------------------------- |
| Le site Web                    | [par ici 👉](https://github.com/etalab/annuaire-entreprises-site)         |
| L’API du Moteur de recherche   | [par ici 👉](https://github.com/etalab/annuaire-entreprises-search-api)   |
| L‘API de redondance de Sirene  | [par ici 👉](https://github.com/etalab/annuaire-entreprises-sirene-api)   |
| L‘infra du moteur de recherche | [par ici 👉](https://github.com/etalab/annuaire-entreprises-search-infra) |
| Le proxy API du site           | [par ici 👉](https://github.com/etalab/annuaire-entreprises-api-proxy)    |

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
// get IMR as json response
https://rncs-proxy.api.gouv.fr/imr/:siren

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

Le déploiement se fait par [Github action](https://github.com/etalab/annuaire-entreprises-proxy/actions)

A chaque "merge" sur master :

- Laissez le déploiement se faire automatiquement sur staging via l'action [deploy-staging](https://github.com/etalab/annuaire-entreprises-api-proxy/actions/workflows/deploy-staging.yml)
- Vérifiez vos changements sur staging
- Lancez manuellement le déploiement sur la production : sur [deploy-production](https://github.com/etalab/annuaire-entreprises-api-proxy/actions/workflows/deploy-production.yml) et cliquez sur "Run workflow" -> "Run workflow"

NB: Si plusieurs déploiements sont déclenchés en même temps, seul le premier va jusqu'au bout. Les autres sont automatiquement interrompus.

## Licence

Ce projet est sous AGPL 3.0
