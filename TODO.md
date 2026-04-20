# Fix TypeScript Errors - Remove Nostr (Approved Plan)

## Steps:
- [x] Step 1: Update src/App.tsx - Remove Nostr relayMetadata from defaultConfig
- [x] Step 2: Update src/components/auth/LoginArea.tsx - Add missing imports (React useState, shadcn Button), switch to useCurrentUser()
- [x] Step 3: Rewrite src/hooks/useLoggedInAccounts.ts as Firebase-based hook using useAuth
- [x] Step 4: Verify no TS errors, run tests/build

All steps complete - TS errors fixed, Nostr removed.

