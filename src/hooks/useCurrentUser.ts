import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types/user';

/**
 * Hook to get the currently logged-in user.
 * Returns the Firebase User object.
 */
export function useCurrentUser(): {
  user: User | null;
  loading: boolean;
  users: (User | null)[];
  name: string | null | undefined;
  picture: string | null | undefined;
} {
  const { user, loading } = useAuth();
  
  return {
    user,
    loading,
    users: user ? [user] : [],
    name: user?.displayName,
    picture: user?.photoURL,
  };
}