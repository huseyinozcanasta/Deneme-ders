import { useState, useEffect, useCallback } from 'react';
import type { StudyAppState } from '@/types/study';
import type { GoogleUser } from './useGoogleAuth';
import { useGoogleAuth } from './useGoogleAuth';
import { exportStudyDataToDrive, loadStudyDataFromDrive, getDriveFileList } from '@/lib/driveUtils';

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export function useGoogleDrive(user: GoogleUser | null) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { gapiLoaded } = useGoogleAuth();

  const listFiles = useCallback(async () => {
    if (!user || !gapiLoaded) return;
    setIsLoading(true);
    try {
      const fileList = await getDriveFileList(user);
      setFiles(fileList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Drive list error');
    } finally {
      setIsLoading(false);
    }
  }, [user, gapiLoaded]);

  const saveState = useCallback(async (state: StudyAppState): Promise<string> => {
    if (!user || !gapiLoaded) throw new Error('Google Drive not ready');
    return exportStudyDataToDrive(state, user);
  }, [user, gapiLoaded]);

  const loadState = useCallback(async (fileId: string): Promise<StudyAppState> => {
    if (!user || !gapiLoaded) throw new Error('Google Drive not ready');
    return loadStudyDataFromDrive(user, fileId);
  }, [user, gapiLoaded]);

  useEffect(() => {
    if (user && gapiLoaded) {
      listFiles();
    }
  }, [user, gapiLoaded, listFiles]);

  return {
    files,
    saveState,
    loadState,
    listFiles,
    isLoading,
    error,
    gapiLoaded,
  };
}
