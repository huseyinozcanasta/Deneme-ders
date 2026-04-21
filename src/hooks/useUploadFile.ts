import { useMutation } from "@tanstack/react-query";
import { BlossomUploader } from '@nostrify/nostrify/uploaders';

import { useCurrentUser } from "./useCurrentUser";

export function useUploadFile() {
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) {
        throw new Error('Must be logged in to upload files');
      }

      if (!('signer' in user) || !user.signer) {
        throw new Error('Nostr signer required for image upload. Please log in with a Nostr extension.');
      }

      const uploader = new BlossomUploader({
        servers: [
          'https://blossom.primal.net/',
        ],
        signer: (user as any).signer,
      });

      const tags = await uploader.upload(file);
      return tags;
    },
  });
}