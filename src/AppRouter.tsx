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
import { AuthGuard } from "./components/auth/AuthGuard";

export function AppRouter() {
  return (
    <BrowserRouter basename="/Deneme-ders">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
        <Route path="/subjects" element={<SubjectList />} />
        <Route path="/subject/:id" element={<SubjectDetail />} />
        <Route path="/review" element={<SpacedRepetition />} />
        <Route path="/planner" element={<StudyPlanner />} />
        <Route path="/stats" element={<StatsDashboard />} />
        <Route path="/:nip19" element={<NIP19Page />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
