import { useAuth } from '@/contexts/AuthContext';

export function useCurrentUser() {
  const { user, loading } = useAuth();
  return {
    user,
    loading,
    users: user ? [user] : [],
    name: user?.displayName,
    picture: user?.photoURL,
    pubkey: undefined,
  };
}

