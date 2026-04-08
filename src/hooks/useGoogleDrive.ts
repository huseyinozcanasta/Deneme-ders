import { useState, useEffect, useCallback } from 'react';
import type { StudyAppState } from '@/types/study';
import type { GoogleUser } from './useGoogleAuth';
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

  const listFiles = useCallback(async () => {
    if (!user) return;
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
  }, [user]);

  const saveState = useCallback(async (state: StudyAppState): Promise<string> => {
    if (!user) throw new Error('No Google user');
    return exportStudyDataToDrive(state, user);
  }, [user]);

  const loadState = useCallback(async (fileId: string): Promise<StudyAppState> => {
    if (!user) throw new Error('No Google user');
    return loadStudyDataFromDrive(user, fileId);
  }, [user]);

  useEffect(() => {
    if (user) {
      listFiles();
    }
  }, [user, listFiles]);

  return {
    files,
    saveState,
    loadState,
    listFiles,
    isLoading,
    error,
  };
}

