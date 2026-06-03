# Contributing — souply-web

React + Vite creator dashboard (SSR Node server for `/t/:slug` OG previews).

## Branches & flow
- `main` — **production** (`souply.lt`). Protected: PRs only, CI must pass, no force-push.
- `staging` — integration (`souply.manofoto.dpdns.org`).
- `feature/*` — your work, off `staging`.

Flow: `feature/*` → PR into `staging` → validate → PR `staging` → `main` → prod deploy.

## Local setup
```bash
npm install
# .env.local holds the gated dev-auth shortcut for local work:
#   VITE_ENABLE_DEV_AUTH=1 + VITE_DEV_USER_* (never shipped to prod — host-gated + tree-shaken)
npm run dev                            # vite on :5173
```

## Build & tests
```bash
npm run build            # tsc -b && vite build — THIS is the real type gate (stricter than `tsc --noEmit`)
npm run verify:prod-clean# builds with dev-auth OFF and greps dist to prove the bypass never ships
npm test                 # vitest; .env.test enables dev-auth so SideBand/App tests can exercise it
npm run lint             # eslint (0 errors required; some react-hooks/refresh rules are warnings for now)
```
> Always verify web changes with **`npm run build`**, not just `tsc --noEmit` — the build catches errors the latter misses.

## Commits
Conventional Commits via commitlint (husky). **Header ≤ 100 chars.** Pre-commit runs `lint-staged` (`eslint --fix` on staged files).

## CI (GitHub Actions)
On push/PR to `main`/`staging`: **typecheck + lint + test + build + verify:prod-clean**. Must pass before merge to `main`.
