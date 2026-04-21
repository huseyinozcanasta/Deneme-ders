import { useMutation } from "@tanstack/react-query";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '@/lib/firebase';
import { useCurrentUser } from "./useCurrentUser";

export function useUploadFile() {
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) {
        throw new Error('Must be logged in to upload files');
      }

      const userFirebase = auth.currentUser;
      if (!userFirebase) {
        throw new Error('Firebase user not found');
      }

      // Firebase Storage upload path: images/{uid}/{filename}
      const filePath = `images/${userFirebase.uid}/${file.name}`;
      const storageRef = ref(storage, filePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      // Return Nostr-compatible tag format: [['url', downloadURL]]
      return [['url', url]];
    },
  });
}
