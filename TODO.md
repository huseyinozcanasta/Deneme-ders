# Google Login + Drive Save Implementation
Current: ✅ Phase 0 Complete

## 📋 Implementation Phases

### **✅ Phase 0: Planning Complete**
- [x] Analyzed auth (Nostr-only), study storage (IndexedDB)
- [x] Confirmed Drive API Client ID provided
- [x] User approved full integration

- [x] Created `src/lib/driveUtils.ts`

### **🔄 Phase 2: Google Auth Integration** (Current)
- [ ] Update `LoginDialog.tsx` → Google SignIn button
- [ ] Update `AccountSwitcher.tsx` → Show Google accounts
- [ ] Extend `useLoggedInAccounts` → Handle Google users

### **Phase 3: Drive Export**
- [ ] Create `DriveExportDialog.tsx`
- [ ] Add export buttons to `SubjectDetail.tsx`/`StudyMode.tsx`
- [ ] Export StudyAppState as JSON to user's Drive

### **Phase 4: Polish & Test**
- [ ] Multi-auth support (Nostr + Google)
- [ ] Error handling, loading states
- [ ] Test login/export flow

### **✅ Phase 1 Complete!** 🎉\n\n**Next:** Phase 2 - Google Auth UI Integration

