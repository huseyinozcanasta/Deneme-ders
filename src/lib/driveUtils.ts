import type { StudyAppState } from '@/types/study';
import { GoogleUser } from '@/hooks/useGoogleAuth';

declare global {
  interface Window {
    gapi: any;
  }
}

export async function exportStudyDataToDrive(
  state: StudyAppState,
  user: GoogleUser,
  filename = `studyflow-${user.email.replace(/[@.]/g, '_')}-${new Date().toISOString().slice(0, 10)}.json`
): Promise<string> {
  if (!window.gapi?.client?.drive) {
    throw new Error('Google Drive API not loaded');
  }

  const fileContent = JSON.stringify(state, null, 2);
  const bytes = new TextEncoder().encode(fileContent);
  const arrayBuffer = bytes.buffer;
  const blob = new Blob([arrayBuffer], { type: 'application/json' });

  const metadata = {
    name: filename,
    mimeType: 'application/json',
    parents: [], // User's root Drive
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob, filename);

  const response = await window.gapi.client.request({
    path: '/upload/drive/v3/files',
    method: 'POST',
    params: { uploadType: 'multipart' },
    headers: { 'Content-Type': 'multipart/related' },
    body: form,
  });

  return response.result.webViewLink;
}

export async function loadStudyDataFromDrive(
  user: GoogleUser,
  fileId: string
): Promise<StudyAppState> {
  if (!window.gapi?.client?.drive) {
    throw new Error('Google Drive API not loaded');
  }

  const response = await window.gapi.client.drive.files.get({
    fileId,
    alt: 'media',
  });

  return JSON.parse(response.body);
}

export function getDriveFileList(user: GoogleUser): Promise<any[]> {
  return window.gapi.client.drive.files.list({
    q: `name contains 'studyflow' and trashed=false`,
    fields: 'files(id, name, modifiedTime)',
    pageSize: 10,
  }).then((res: any) => res.result.files || []);
}

