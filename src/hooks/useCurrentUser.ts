import { useAuth } from '@/contexts/AuthContext';

export function useCurrentUser() {
  const { user } = useAuth();
  return {
    user,
    users: user ? [user] : [],
    name: user?.displayName,
    picture: user?.photoURL,
    pubkey: undefined,
  };
}

