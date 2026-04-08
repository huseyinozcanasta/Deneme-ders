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
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

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
      script.onload = () => {
        initializeGoogleSignIn();
        loadGapiClient();
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
    setIsLoading(false);
  }, []);

  const initializeGoogleSignIn = () => {
    const w = window as any;
    if (w.google && w.google.accounts && w.google.accounts.id) {
      w.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
    }
  };

  const loadGapiClient = async () => {
    if (document.querySelector('#gapi-client')) return;
    
    const gapiScript = document.createElement('script');
    gapiScript.id = 'gapi-client';
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = initGapiClient;
    document.head.appendChild(gapiScript);
  };

  const initGapiClient = async () => {
    const w = window as any;
    if (w.gapi) {
      await new Promise((resolve, reject) => {
        w.gapi.load('client:auth2:drive-share', { callback: resolve, onerror: reject });
      });
      await w.gapi.client.init({
        clientId: GOOGLE_CLIENT_ID,
        scope: SCOPES.join(' '),
        discoveryDocs: ['https://www.googleapis.com/discovery/v3/apis/drive/v3/rest'],
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
    toast({
      title: 'Google oturumu kapatıldı',
    });
  }, [toast]);

  const [gapiLoaded, setGapiLoaded] = useState(false);

  useEffect(() => {
    const checkGapi = async () => {
      const w = window as any;
      if (w.gapi?.client) {
        setGapiLoaded(true);
      }
    };
    checkGapi();
    const interval = setInterval(checkGapi, 500);
    return () => clearInterval(interval);
  }, []);

  return {
    user,
    signIn: handleCredentialResponse,
    signOut,
    isSignedIn: !!user,
    isLoading,
    gapiLoaded,
  };
}

