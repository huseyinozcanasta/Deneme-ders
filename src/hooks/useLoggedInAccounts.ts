import type { GoogleUser } from './useGoogleAuth';
import { useGoogleAuth } from './useGoogleAuth';

export interface Account {
  id: string;
  type: 'google';
  googleUser: GoogleUser;
  metadata: {
    name: string;
    picture: string;
  };
}

export function useLoggedInAccounts() {
  const googleAuth = useGoogleAuth();

  const googleAccount: Account | undefined = googleAuth.user ? {
    id: `google_${googleAuth.user.id}`,
    type: 'google',
    googleUser: googleAuth.user,
    metadata: {
      name: googleAuth.user.name,
      picture: googleAuth.user.picture,
    },
  } : undefined;

  // Current user: Google account
  const currentUser: Account | undefined = googleAccount;

  return {
    currentUser,
    googleAccount,
    signOutGoogle: googleAuth.signOut,
  };
}
