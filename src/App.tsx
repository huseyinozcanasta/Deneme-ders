import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/components/AppProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { StudyAppProvider } from '@/contexts/StudyAppContext';
import AppRouter from '@/AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

const defaultConfig = {
  theme: 'system' as const,
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <ErrorBoundary>
<AppProvider storageKey="studyflow-app" defaultConfig={defaultConfig}>
            <StudyAppProvider>
              <AuthProvider> {/* Firebase Auth wrapper */}
                <AppRouter />
                <Toaster />
              </AuthProvider>
            </StudyAppProvider>
          </AppProvider>
        </ErrorBoundary>
      </StrictMode>
    </QueryClientProvider>
  );
}

