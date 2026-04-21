import { useAuth } from '@/contexts/AuthContext';
import type { User, NostrUserMetadata } from '@/types/user';

/**
 * Hook to get the currently logged-in user.
 * Returns the User object with Firebase and Nostr properties.
 */
export function useCurrentUser(): {
  user: User | null;
  loading: boolean;
  users: (User | null)[];
  name: string | null | undefined;
  picture: string | null | undefined;
  pubkey: string | undefined;
  /** Combined metadata from Firebase and Nostr */
  metadata: NostrUserMetadata | undefined;
} {
  const { user, loading } = useAuth();
  
  // Combine Firebase user data with Nostr metadata
  const metadata: NostrUserMetadata | undefined = user ? {
    name: user.displayName || undefined,
    picture: user.photoURL || undefined,
    // Include Nostr metadata if available
    ...user.nostrMetadata,
  } : undefined;
  
  return {
    user,
    loading,
    users: user ? [user] : [],
    name: user?.displayName,
    picture: user?.photoURL,
    pubkey: user?.pubkey,
    metadata,
  };
}