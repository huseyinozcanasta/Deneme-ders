import { useNostr } from '@nostrify/react';
import { useNostrLogin } from '@nostrify/react/login';
import { useQuery } from '@tanstack/react-query';
import { NSchema as n, NostrEvent, NostrMetadata } from '@nostrify/nostrify';
import type { GoogleUser } from './useGoogleAuth';
import { useGoogleAuth } from './useGoogleAuth';

export interface Account {
  id: string;
  type: 'nostr' | 'google';
  pubkey?: string;
  googleUser?: GoogleUser;
  event?: NostrEvent;
  metadata: NostrMetadata;
}

export function useLoggedInAccounts() {
  const { nostr } = useNostr();
  const { logins, setLogin, removeLogin } = useNostrLogin();
  const googleAuth = useGoogleAuth();

  const { data: authors = [] } = useQuery({
    queryKey: ['nostr', 'logins', logins.map((l) => l.id).join(';')],
    queryFn: async () => {
      const events = await nostr.query(
        [{ kinds: [0], authors: logins.map((l) => l.pubkey) }],
        { signal: AbortSignal.timeout(1500) },
      );

      return logins.map(({ id, pubkey }): Account => {
        const event = events.find((e) => e.pubkey === pubkey);
        try {
          const metadata = n.json().pipe(n.metadata()).parse(event?.content);
          return { id, type: 'nostr' as const, pubkey, metadata, event };
        } catch {
          return { id, type: 'nostr' as const, pubkey, metadata: {}, event };
        }
      });
    },
    retry: 3,
  });

  const googleAccount: Account | undefined = googleAuth.user ? {
    id: `google_${googleAuth.user.id}`,
    type: 'google' as const,
    googleUser: googleAuth.user,
    metadata: {
      name: googleAuth.user.name,
      picture: googleAuth.user.picture,
    },
  } : undefined;

  // Current user: Google primary if signed in, fallback first Nostr
  const currentUser: Account | undefined = googleAccount || (() => {
    const login = logins[0];
    if (!login) return undefined;
    const author = authors.find((a) => a.id === login.id);
    return author || { id: login.id, type: 'nostr' as const, pubkey: login.pubkey, metadata: {} };
  })();

  // Other users: all except current
  const otherUsers = (() => {
    const allUsers = authors as Account[];
    if (googleAccount && currentUser === googleAccount) {
      return allUsers;
    }
    return allUsers.slice(1);
  })();

  const signOutGoogle = googleAuth.signOut;

  return {
    authors,
    currentUser,
    otherUsers,
    googleAccount,
    setLogin,
    removeLogin,
    signOutGoogle,
  };
}
