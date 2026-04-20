# Task: Fix 404 errors on deployed GitHub Pages site (hashed assets, icon.svg, manifest)

## Steps:
1. [x] Create public/manifest.webmanifest with basic PWA config and icon reference
2. [x] Create public/icon.svg (simple placeholder icon)
3. [x] Update vite.config.ts to add `base: '/Deneme-ders/'` for subdir deployment
4. [x] Build project (`npm run build`) and verify dist/assets exist, no 404s locally
5. [x] Update deploy instructions in README or package.json for GH Pages/Firebase
6. [x] [Optional] Deploy to Firebase Hosting for better SPA support - See README.md
