
import { useCurrentUser } from './useCurrentUser';

export interface Account {
  id: string;
  pubkey: string;
  metadata: any;
}

export function useLoggedInAccounts() {
  const currentUserHook = useCurrentUser();

  const currentUser = currentUserHook.users[0] ? {
    id: currentUserHook.users[0].uid,
    pubkey: currentUserHook.users[0].uid,
    metadata: {
      name: currentUserHook.name,
      picture: currentUserHook.picture,
    }
  } : undefined;

  const otherUsers: Account[] = [];

  return {
    authors: [currentUser].filter(Boolean) as Account[],
    currentUser,
    otherUsers,
    setLogin: () => {},
    removeLogin: () => {},
  };
}



