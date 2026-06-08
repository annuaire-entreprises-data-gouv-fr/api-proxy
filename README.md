<h1 align="center">
  <img src="https://github.com/annuaire-entreprises-data-gouv-fr/.github/assets/8900205/b1fb5c11-8199-451c-a0ac-808c9bfa97cd" width="400px" />
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
pnpm i

# Lancer le service en dev
pnpm dev

# Lancer le service en prod
pnpm build && pnpm start

```

## Utilisation

L’API du proxy en staging et production est protégée en appel par un header `X-API-Key`

Le service expose les routes suivantes :

```txt
GET /                                  # healthcheck simple
GET /rne/:siren                        # donnees RNE depuis l'API INPI
GET /rne/observations/fallback/:siren  # observations RNE depuis le site INPI
GET /status/rne                        # statut de l'API RNE
GET /tva/:tvaNumber                    # validation d'un numero de TVA
GET /eori/:siret                       # validation EORI
GET /ig/:siren                         # donnees Unite Legale IG
GET /feature-flags                     # feature flags mis en cache
```

La route TVA accepte le parametre de query optionnel `useCache=false`.

### Tests

1. Linter

```bash
pnpm lint
```

2. Tests unitaires

```bash
pnpm test
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
