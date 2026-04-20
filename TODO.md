# Firebase Email/Google Auth Integration TODO

## Steps:
1. [x] Wrap App.tsx with AuthProvider from src/contexts/AuthContext.tsx.
2. [x] Add /login route to src/AppRouter.tsx.
3. [x] Update src/pages/Login.tsx with Firebase email/password register/login form + Google button. Remove Nostr LoginArea.
4. [x] Add auth guard to src/pages/Index.tsx: redirect to /login if no user.\n5. [x] Read src/pages/Index.tsx content for integration.
6. [x] Test: npm run dev, check redirect and auth flows.\n7. [x] Verify Firebase Console: Enable Email/Password and Google providers.\n\n**Task complete!**

**Notes**: Remove Nostr auth dependency. Auto-redirect unauth users to /login page.
