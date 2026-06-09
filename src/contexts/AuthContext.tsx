import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { FirebaseError } from 'firebase/app';
import { onAuthStateChanged, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/types/user';

// Firebase hata kodlarını Türkçe mesajlara çevir
const getFirebaseErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-credential': 'E-posta veya şifre hatalı.',
    'auth/user-not-found': 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.',
    'auth/wrong-password': 'Şifre hatalı.',
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
    'auth/weak-password': 'Şifre çok zayıf. En az 6 karakter olmalıdır.',
    'auth/too-many-requests': 'Çok fazla deneme yaptınız. Lütfen bir süre bekleyin.',
    'auth/network-request-failed': 'İnternet bağlantınızı kontrol edin.',
    'auth/popup-closed-by-user': 'Google giriş penceresi kapatıldı.',
    'auth/account-exists-with-different-credential': 'Bu e-posta adresi başka bir yöntemle kayıtlı.',
    'auth/requires-recent-login': 'Bu işlem için tekrar giriş yapmanız gerekiyor.',
    'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
  };
  return errorMessages[code] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? firebaseUser.email : 'null');
      if (firebaseUser) {
        setUser(firebaseUser);
        setError(null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInEmail = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('[Auth] signInEmail success:', result.user?.email);
    } catch (err: unknown) {
      const firebaseErr = err instanceof FirebaseError ? err : null;
      console.error('[Auth] signInEmail failed:', firebaseErr?.code, firebaseErr?.message);
      setError(getFirebaseErrorMessage(firebaseErr?.code ?? ''));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerEmail = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[Auth] registerEmail success:', result.user?.email);
    } catch (err: unknown) {
      const firebaseErr = err instanceof FirebaseError ? err : null;
      console.error('[Auth] registerEmail failed:', firebaseErr?.code, firebaseErr?.message);
      setError(getFirebaseErrorMessage(firebaseErr?.code ?? ''));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('[Auth] Google signIn success:', result.user?.email);
    } catch (err: unknown) {
      const firebaseErr = err instanceof FirebaseError ? err : null;
      console.error('[Auth] Google signIn failed:', firebaseErr?.code, firebaseErr?.message);
      setError(getFirebaseErrorMessage(firebaseErr?.code ?? ''));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Çıkış başarısız oldu.');
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInEmail,
    registerEmail,
    signInGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

