import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  token: string;
}

const GOOGLE_CLIENT_ID = '487543549178-batpljj5eclugfm7e95isksf575hnudr.apps.googleusercontent.com';

export function useGoogleAuth() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const existingScript = document.querySelector('#google-gsi');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.head.appendChild(script);
    } else {
      initializeGoogle();
    }
    setIsLoading(false);
  }, []);

  const initializeGoogle = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('google_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem('google_user');
      }
    }
  }, []);

  const handleCredentialResponse = useCallback((response: any) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const googleUser: GoogleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        token: response.credential,
      };
      setUser(googleUser);
      localStorage.setItem('google_user', JSON.stringify(googleUser));
      toast({
        title: 'Google ile giriş başarılı!',
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Google giriş hatası',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem('google_user');
    // Note: Full sign-out requires gapi.auth2 which needs more setup
    toast({
      title: 'Google oturumu kapatıldı',
    });
  }, [toast]);

  return {
    user,
    signIn: handleCredentialResponse,
    signOut,
    isSignedIn: !!user,
    isLoading,
  };
}

