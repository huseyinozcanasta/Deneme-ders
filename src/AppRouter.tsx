import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";
import { SubjectList } from "./components/study/SubjectList";
import { SubjectDetail } from "./components/study/SubjectDetail";
import { SpacedRepetition } from "./components/study/SpacedRepetition";
import { StudyPlanner } from "./components/study/StudyPlanner";
import { StatsDashboard } from "./components/study/StatsDashboard";
import DenemeDers from "./pages/DenemeDers";
import LoginPage from "./pages/Login";
import SettingsPage from "./pages/Settings";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthGate } from "./components/auth/AuthGate";

export function AppRouter() {
  return (
<BrowserRouter basename={import.meta.env.DEV ? "/" : "/Deneme-ders/"}>
      <ScrollToTop />
      <Routes>
<Route path="/" element={<AuthGate />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/subjects" 
          element={
            <ProtectedRoute>
              <SubjectList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subject/:id" 
          element={
            <ProtectedRoute>
              <SubjectDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/review" 
          element={
            <ProtectedRoute>
              <SpacedRepetition />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/planner" 
          element={
            <ProtectedRoute>
              <StudyPlanner />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stats" 
          element={
            <ProtectedRoute>
              <StatsDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/Deneme-ders" element={<DenemeDers />} />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;