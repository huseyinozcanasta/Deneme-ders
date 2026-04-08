// NOTE: This file should normally not be modified unless you are adding a new provider.
// To add new routes, edit the AppRouter.tsx file.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHead, UnheadProvider } from '@unhead/react/client';
import { InferSeoMetaPlugin } from '@unhead/addons';
import { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from '@/components/AppProvider';
import { StudyAppProvider } from '@/contexts/StudyAppContext';
import AppRouter from './AppRouter';
import { GoogleProvider } from '@/contexts/GoogleProvider';

const head = createHead({
  plugins: [
    InferSeoMetaPlugin(),
  ],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: Infinity,
    },
  },
});

export function App() {
  return (
    <UnheadProvider head={head}>
      <AppProvider storageKey="app-config" defaultConfig={{ theme: "system", relayMetadata: { relays: [], updatedAt: 0 } }}>  
        <GoogleProvider>
          <QueryClientProvider client={queryClient}>
            <StudyAppProvider>
              <TooltipProvider>
                <Toaster />
                <Suspense>
                  <AppRouter />
                </Suspense>
              </TooltipProvider>
            </StudyAppProvider>
          </QueryClientProvider>
        </GoogleProvider>
      </AppProvider>
    </UnheadProvider>
  );
}

export default App;
