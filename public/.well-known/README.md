# Deep-link association files (Universal Links / App Links)

These two files let a tap/scan on `https://<domain>/t/<slug>` (or `/@<handle>`)
open the **Souply app** instead of the browser, when the app is installed.
Vite copies `public/.well-known/` into `dist/`, and the server serves it (the
extension-less Apple file is served as JSON by an explicit route in
`server/index.js`).

The **same files are served from every domain** (localhost has no role here —
universal links need a real HTTPS host):

| Environment | Domain | App that opens |
|---|---|---|
| test | `souply.manofoto.dpdns.org` | `lt.souply.app.dev` (DEV build) |
| prod | `souply.lt` | `lt.souply.app` (prod build) |

Both files list **both** apps, so either domain validates whichever build is
installed. The app side is wired in `souply-app/app.config.js`
(`associatedDomains` / `intentFilters`, switched per `APP_VARIANT`).

## What you MUST fill in before this works

### `apple-app-site-association` (iOS)
Replace `REPLACE_WITH_APPLE_TEAM_ID` (both occurrences) with your Apple
Developer **Team ID** (10 chars, e.g. `A1B2C3D4E5`). Find it at
developer.apple.com → Membership, or in the app's provisioning profile.
Result looks like `A1B2C3D4E5.lt.souply.app`.

### `assetlinks.json` (Android)
Replace the two `REPLACE_WITH_*_SHA256_FINGERPRINT` values with the **SHA-256
signing-certificate fingerprints** of each build:
- EAS-managed signing: `eas credentials` → Android → pick the build profile →
  copy the SHA-256 fingerprint, OR
- Play Console → Release → Setup → App signing → "App signing key certificate"
  SHA-256 (this is the one that matters for installed-from-Play apps).

Format: uppercase hex, colon-separated, e.g.
`AB:CD:EF:...:01`. You can list more than one per package (e.g. upload key +
Play app-signing key) — make the value an array.

## Verify after deploy
- iOS: `https://<domain>/.well-known/apple-app-site-association` returns the
  JSON with `Content-Type: application/json` and **no redirect**.
- Android: `https://<domain>/.well-known/assetlinks.json` returns the JSON, and
  Google's tester passes:
  `https://developers.google.com/digital-asset-links/tools/generator`
- Reinstall the app after the files go live so the OS re-fetches the
  association (iOS caches it at install time).
