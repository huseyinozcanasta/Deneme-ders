// Placeholder hook - Nostr functionality disabled, Firebase-only mode
export function useNostrPublish() {
  return {
    mutateAsync: async () => {
      throw new Error('Nostr publishing is disabled. App is running in Firebase-only mode.');
    },
    mutate: () => {
      throw new Error('Nostr publishing is disabled. App is running in Firebase-only mode.');
    },
    isPending: false,
    isError: false,
    error: null,
    data: undefined,
  };
}

export default useNostrPublish;
