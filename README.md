# StudyFlow

Study app with Nostr, Firebase, Gemini integration.

## Development

```bash
npm run dev
```

Open http://localhost:8080

## Build & Deploy

1. **GitHub Pages** (fixes 404s):
   ```
   npm run build
   ```
   - Hashed assets now use base `/Deneme-ders/` (vite.config.ts)
   - Copy `dist/` to `gh-pages` branch root of huseyinozcanasta/Deneme-ders
   - manifest.webmanifest & icon.svg included to fix icon errors

2. **Firebase Hosting** (recommended for SPA):
   ```
   npm run build
   firebase deploy
   ```
   - Uses firebase.json config
   - Automatic SPA rewrites

## Fixes Applied
- Added `base: '/Deneme-ders/'` in production builds
- Created `public/manifest.webmanifest` & `public/icon.svg` → no more 404s
- Build generates `/Deneme-ders/assets/*.js|css` paths

Test deploy: Assets should load, no console 404s.

