import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/components/AppProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import NostrProvider from '@/components/NostrProvider';
import { DMProvider } from '@/components/DMProvider';
import AppRouter from './AppRouter';
import { AppContext } from '@/contexts/AppContext';
import { PROTOCOL_MODE } from '@/lib/dmConstants';

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
  relayMetadata: {
    relays: [
      {
        url: 'wss://relay.damus.io',
        read: true,
        write: true,
      },
      {
        url: 'wss://nostr-pub.wellorder.net',
        read: true,
        write: true,
      },
    ],
    updatedAt: Date.now(),
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <ErrorBoundary>
          <AppProvider storageKey="studyflow-app" defaultConfig={defaultConfig}>
            <NostrProvider>
              <DMProvider config={{ enabled: true, protocolMode: PROTOCOL_MODE.NIP17_ONLY }}>
                <AppRouter />
                <Toaster />
              </DMProvider>
            </NostrProvider>
          </AppProvider>
        </ErrorBoundary>
      </StrictMode>
    </QueryClientProvider>
  );
}

