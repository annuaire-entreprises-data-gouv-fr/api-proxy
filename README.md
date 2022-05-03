# Proxy de l'API RNCS

[![Pre-merge checks](https://github.com/etalab/rncs-api-proxy/actions/workflows/pre-merge.yml/badge.svg)](https://github.com/etalab/rncs-api-proxy/actions/workflows/pre-merge.yml)
[![Deploy - Staging](https://github.com/etalab/rncs-api-proxy/actions/workflows/deploy-staging.yml/badge.svg)](https://github.com/etalab/rncs-api-proxy/actions/workflows/deploy-staging.yml)
[![Deploy - Production](https://github.com/etalab/rncs-api-proxy/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/etalab/rncs-api-proxy/actions/workflows/deploy-production.yml)

Ce proxy permet de compenser les instabilités des services d’accès au RNCS proposés par l’INPI.

## Architecture du service 🏗

Ce repository fait partie d'un ensemble de services qui constituent l'[Annuaire des Entreprises](https://annuaire-entreprises.data.gouv.fr) :

| Description                    | Accès                                                                     |
| ------------------------------ | ------------------------------------------------------------------------- |
| Le site Web                    | [par ici 👉](https://github.com/etalab/annuaire-entreprises-site)         |
| L’API du Moteur de recherche   | [par ici 👉](https://github.com/etalab/annuaire-entreprises-search-api)   |
| L‘API de redondance de Sirene  | [par ici 👉](https://github.com/etalab/annuaire-entreprises-sirene-api)   |
| L‘infra du moteur de recherche | [par ici 👉](https://github.com/etalab/annuaire-entreprises-search-infra) |
| L’API de proxy du RNCS         | [par ici 👉](https://github.com/etalab/rncs-api-proxy)                    |

## Installation

```bash
# Installation
npm i

# Lancer le site en dev
npm run dev

# Lancer le site en prod
npm run build && npm run start

```

## Licence

Ce projet est sous AGPL 3.0
