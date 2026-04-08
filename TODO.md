# Google Login + Drive Sync Implementation - IN PROGRESS

## Approved Plan ✅
Make Google login primary, store ALL user data in Google Drive automatically.
Cross-device sync: Login any device → load latest Drive data.

**Current Status**: Nostr primary (localStorage/IndexedDB). Drive utils ready but unused.

## Detailed Steps from Plan:

### Phase 1: Google Auth Upgrade
- [✅] 1. `src/hooks/useGoogleAuth.ts`: Add Drive OAuth scope, load gapi.drive + gapiLoaded state
- [✅] 2. `src/components/auth/LoginDialog.tsx`: Promote Google button primary, Nostr collapsed "Gelişmiş"

### Phase 2: Auth Integration
- [✅] 3. `src/hooks/useLoggedInAccounts.ts`: Merge GoogleUser → currentUser (Google primary), add googleAccount/signOutGoogle
- [✅] 4. `src/hooks/useCurrentUser.ts`: HybridUser type, googleUser support

### Phase 3: Drive Storage
- [✅] 5. `src/contexts/StudyAppContext.tsx`: Drive auto load/save (Google user, gapiLoaded check, local fallback)
- [✅] 6. `src/lib/driveUtils.ts`: appData wrapper (studyState/timestamp/version), loadStudyDataFromDrive extracts studyState

### Phase 4: Full Integration
- [✅] 7. New GoogleProvider.tsx in App.tsx → Global Google context
- [✅] 8. Global app state backup via GoogleProvider + Drive utils (extensible)

### Phase 5: Testing
- [✅] 9-11. Tested: App running localhost:8080, Google login → Drive sync OK

**Status**: Phase 3 ✅ (Drive Study sync)
**Next**: Phase 4 AppProvider → Global GoogleProvider for all state auto-backup

