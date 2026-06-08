# AGENTS.md

Guidance for coding agents working in this repository.

## Project Shape

This is the API proxy for Annuaire des Entreprises. The HTTP server is defined in `index.ts` and delegates to controllers in `src/controllers`.

The service is built on Hono:

- Use `Hono` and `@hono/node-server` for server wiring.
- Use `secureHeaders()` from `hono/secure-headers` for security headers.
- Route handlers should return Hono responses with `c.json(...)`, `c.text(...)`, or `c.body(...)`.

## Hono Controller Typing

When exporting controllers, type them with the route path so params are inferred:

```ts
import type { Handler } from "hono";

export const rneControllerAPI: Handler<object, "/rne/:siren"> = async (c) => {
  const siren = c.req.param("siren");
  return c.json({ siren });
};
```

This lets TypeScript catch wrong param names. Avoid generic `Context` for route controllers with path params unless there is no better option.

Hono params are typed as strings for typed routes, so pass them directly into validators such as `verifySiren`, `verifySiret`, and `verifyTVANumber`.

For request cancellation, use the Fetch request signal:

```ts
c.req.raw.signal
```

## Error Handling

Application errors use `src/http-exceptions.ts`. The central Hono error boundary is wired with `app.onError(...)` in `index.ts` and delegates to `src/controllers/error-handler.ts`.

When returning dynamic status codes with Hono, you may need to cast to `ContentfulStatusCode` at the boundary because app exceptions store status as `number`.

## Feature Flags

`startPollingFeatureFlags()` starts when the server starts and is cleared on server close. Local smoke tests may trigger network calls to Grist and fallback writes to `feature-flags.json`; avoid changing that behavior unless the task is explicitly about feature flags.

## Commands

Use these checks before handing off code changes:

```bash
npm run build
npm run lint
npm test
```

Scripts are defined in `package.json`:

- `npm run dev` starts `nodemon index.ts`.
- `npm run build` runs `tsc`.
- `npm run lint` runs `ultracite check`.
- `npm test` runs Jest serially.

The project uses `pnpm` for dependency management and lockfiles. If `pnpm` reports an unexpected store location, use the existing user store rather than creating a workspace store:

```bash
pnpm add <package> --store-dir /Users/alanchauchet/Library/pnpm/store/v11
pnpm remove <package> --store-dir /Users/alanchauchet/Library/pnpm/store/v11
```

## Style Notes

- Prefer small, direct controller changes over new abstractions.
- Keep route behavior, response bodies, and status codes stable unless requested.
- Use `rg` for searching.
- Use `apply_patch` for manual edits.
- Do not commit, stage, or push unless explicitly asked.
- Preserve user changes in the worktree.
