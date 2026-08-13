# souply-web

Web client for [Souply](https://souply.lt) — a grocery price-comparison platform for the
Lithuanian market. This repo covers the marketing landing page, creator authentication,
the creator dashboard, and the public pages that shared links resolve to.

Souply is split across four repositories:

| Repo | Role |
|---|---|
| `souply-app` | React Native / Expo mobile client — receipt scanning, basket building |
| `souply-api` | Node / Express / MariaDB backend — pricing, matching, scrapers |
| `souply-shared` | Receipt parsers and configuration shared between app and API |
| **`souply-web`** | **This repo — web client** |

## Stack

- **Vite 8 · React 19 · TypeScript 6** (strict, `@/*` path alias)
- **Tailwind CSS 3** — palette mirrors the mobile app
- **Framer Motion** — the side-band morph and staggered grid entrance
- **React Router 7** — landing ↔ dashboard driven by auth state
- **i18next** — Lithuanian default, English fallback
- **Vitest · React Testing Library · jsdom**
- **Express 4** — production static server (see *Serving* below)
- **Sentry** for error reporting

## Things worth a look

A few decisions here were less obvious than they appear:

**The production build refuses to ship the dev auth bypass.** Local development can skip
sign-in via `VITE_ENABLE_DEV_AUTH`, which is exactly the kind of flag that escapes into a
release. `npm run verify:prod-clean` builds with those variables blanked and then greps the
emitted bundle for the dev user ID and bypass strings, failing the build if either survives.
The guard checks the artefact rather than the source, so it holds even if the dead-code
elimination changes.

**Sessions are an httpOnly cookie, never localStorage.** Google and Apple sign-in hand an
ID token to the API's `/api/auth/oauth`, which verifies it against the provider's JWKS and
sets the session cookie itself. The browser never holds a readable token, so an XSS bug
can't exfiltrate a session. Requests use `credentials: 'include'` against an explicit CORS
origin allowlist on the API side.

**The Express server exists for three things static hosting can't do.** It server-renders
`/t/:slug` so shared template links produce real link previews; it serves
`/.well-known/apple-app-site-association` with a JSON content type, which `express.static`
would otherwise mislabel as `octet-stream` and break universal links; and it pins
`/version.json` to no-cache so clients can detect a deploy. Everything else is static files
with cache headers.

**Lithuanian is the default locale, not English.** The product is Lithuania-first, so `lt`
is the base and `en` is the fallback — the reverse of the usual setup.

## Running locally

```bash
npm install
npm run dev            # http://localhost:5173
```

The dev server expects `souply-api` reachable for anything beyond the landing page.
Copy `.env.example` if present, or set `VITE_ENABLE_DEV_AUTH=1` to work on authenticated
views without a backend session.

```bash
npm run build          # tsc -b && vite build → dist/
npm run preview        # serve dist/ locally
npm start              # run the production Express server against dist/
npm test               # vitest, single pass
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run verify:prod-clean   # build + assert no dev-auth in the bundle
```

## Layout

```
src/
├── App.tsx              top-level layout choreography (band morph)
├── main.tsx             React root, AuthProvider, i18n bootstrap
├── components/          landing, auth panels, dashboard rail + grid, template cards
├── pages/               AuthCallback · JoinInviteView · PublicTemplateView
│                        LegalPage · NotFound
├── state/auth.tsx       AuthProvider + useAuth (session via httpOnly cookie)
├── lib/api.ts           fetch wrapper — credentials: 'include'
├── i18n/                i18next init + lt/en locales
├── data/                landing carousel config, dashboard shapes
└── test/                jsdom shims and a render helper with providers

server/index.js          production static server + /t/:slug + AASA + /version.json
```

## Deployment

Multi-stage `Dockerfile`, with `docker-compose.staging.yml` and `docker-compose.prod.yml`
for the two deployed environments. Commits follow Conventional Commits, enforced by
commitlint via husky.

## Status and licence

Actively developed and deployed. This repository is published so the work can be read;
it is not currently accepting contributions, and no open-source licence is granted —
all rights reserved.
