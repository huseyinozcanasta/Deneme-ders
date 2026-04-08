import { type NLoginType, NUser, useNostrLogin } from '@nostrify/react/login';
import { useNostr } from '@nostrify/react';
import { useCallback, useMemo } from 'react';

import { useAuthor } from './useAuthor';
import type { GoogleUser } from './useGoogleAuth';
import { useGoogleAuth } from './useGoogleAuth';

export interface HybridUser {
  type: 'nostr' | 'google';
  nostrUser?: NUser;
  googleUser?: GoogleUser;
}

export function useCurrentUser() {
  const { nostr } = useNostr();
  const { logins } = useNostrLogin();
  const googleAuth = useGoogleAuth();

  const loginToUser = useCallback((login: NLoginType): NUser  => {
    switch (login.type) {
      case 'nsec': // Nostr login with secret key
        return NUser.fromNsecLogin(login);
      case 'bunker': // Nostr login with NIP-46 "bunker://" URI
        return NUser.fromBunkerLogin(login, nostr);
      case 'extension': // Nostr login with NIP-07 browser extension
        return NUser.fromExtensionLogin(login);
      // Other login types can be defined here
      default:
        throw new Error(`Unsupported login type: ${login.type}`);
    }
  }, [nostr]);

  const users = useMemo(() => {
    const users: NUser[] = [];

    for (const login of logins) {
      try {
        const user = loginToUser(login);
        users.push(user);
      } catch (error) {
        console.warn('Skipped invalid login', login.id, error);
      }
    }

    return users;
  }, [logins, loginToUser]);

  const nostrUser = users[0] as NUser | undefined;
  const googleUser = googleAuth.user;
  const author = useAuthor(nostrUser?.pubkey);

  const currentUser: HybridUser = {
    type: googleUser ? 'google' : 'nostr',
    ...(googleUser && { googleUser }),
    ...(nostrUser && { nostrUser }),
  };

  return {
    user: currentUser,
    users,
    googleUser,
    ...author.data,
  };
}
