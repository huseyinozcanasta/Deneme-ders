import { useGoogleAuth } from './useGoogleAuth';

export function useCurrentUser() {
  const googleAuth = useGoogleAuth();
  return {
    user: googleAuth.user,
    googleUser: googleAuth.user,
  };
}
