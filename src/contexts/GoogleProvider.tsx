import { createContext, useContext, ReactNode } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

const GoogleContext = createContext<ReturnType<typeof useGoogleAuth> | null>(null);

export function GoogleProvider({ children }: { children: ReactNode }) {
  const googleAuth = useGoogleAuth();
  return <GoogleContext.Provider value={googleAuth}>{children}</GoogleContext.Provider>;
}

export function useGoogleContext() {
  const context = useContext(GoogleContext);
  if (!context) {
    throw new Error('useGoogleContext must be used within GoogleProvider');
  }
  return context;
}

