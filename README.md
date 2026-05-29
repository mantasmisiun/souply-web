# souply-web

Marketing landing + creator authentication + creator dashboard for [Souply](https://souply.lt) —
the Lithuanian grocery price-comparison platform.

The mobile experience lives in `souply-app`; the backend in `souply-api`.

## Stack

- **Vite + React 19 + TypeScript** (strict, with `@/*` path alias)
- **Tailwind CSS 3** with the Souply palette mirroring the mobile app
- **Framer Motion** for the band-slide transition and stagger animations
- **React Router** for `/` ↔ `/dashboard` (driven by auth state)
- **i18next** with Lithuanian (default) + English
- **Vitest + React Testing Library + jsdom** for component + transition specs

## Commands

```bash
npm run dev         # vite dev server at http://localhost:5173
npm run build       # tsc -b && vite build → dist/
npm run preview     # serve dist/ locally to verify the production build
npm run test        # vitest run (CI mode, single pass)
npm run test:watch  # vitest interactive
npm run test:ui     # vitest browser UI
npm run typecheck   # tsc --noEmit on tsconfig.app.json
```

## Layout

```
src/
├── App.tsx                  ← top-level layout choreography (band morph)
├── main.tsx                 ← React root + AuthProvider + i18n bootstrap
├── components/
│   ├── SideBand.tsx         ← white 3D right-edge band (visitor + creator-auth views)
│   ├── FeatureCarousel.tsx  ← auto-advancing card carousel (6s, arrows, dots, ←/→)
│   ├── FeatureCardMockup.tsx← phone-shaped mockup card body
│   ├── BetaSignup.tsx       ← name + email + iOS/Android picker
│   ├── CreatorAuthPanel.tsx ← Google + Apple OAuth buttons
│   ├── BrandMarks.tsx       ← inline Apple / Android / Google SVG marks
│   ├── DashboardRail.tsx    ← left rail post-login (avatar, stats)
│   ├── DashboardGrid.tsx    ← right side templates grid with stagger
│   ├── TemplateCard.tsx     ← per-template card with 6 actions + inline delete confirm
│   └── LanguageSwitcher.tsx ← LT/EN segmented control
├── data/
│   ├── features.ts          ← landing carousel card config (20 user + 7 creator)
│   └── sampleTemplates.ts   ← dashboard placeholder data (shape mirrors API)
├── state/
│   └── auth.tsx             ← AuthProvider + useAuth (tonight: in-memory)
├── i18n/
│   ├── index.ts             ← i18next init (LT default, EN fallback)
│   └── locales/{lt,en}.json
├── lib/
│   ├── cx.ts                ← class-name helper
│   └── motion.ts            ← shared easing + duration tokens
└── test/
    ├── setup.ts             ← jsdom shims (matchMedia, localStorage)
    └── render.tsx           ← test render with i18n + auth providers
```

## Notes for the next wire-up pass

- Beta signup form persists to `localStorage["souply.betaSignups"]` — swap for Mailerlite/Resend.
- OAuth buttons fire `onAuthenticated('login' | 'signup')` — wire to souply-api `/api/auth/google` + `/api/auth/apple`.
- JWT goes in an **httpOnly cookie** (`SameSite=Lax`) on web, not localStorage.
- Templates grid reads from `sampleTemplates`; replace with `GET /api/basket-templates/user/{userId}`.
