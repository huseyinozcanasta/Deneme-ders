// Configuration for the (optional) Shakespeare AI API endpoint.
// Only the API URL helpers are used by the app (see Settings page); the previous
// Nostr/NIP-98 based chat client was removed during the Firebase-only migration.

const DEFAULT_SHAKESPEARE_API_URL = 'https://ai.shakespeare.diy/v1';
const API_URL_STORAGE_KEY = 'shakespeare_api_url';

// Helper to get API URL from localStorage or use default
function getApiUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_SHAKESPEARE_API_URL;
  return localStorage.getItem(API_URL_STORAGE_KEY) || DEFAULT_SHAKESPEARE_API_URL;
}

// Helper to set API URL in localStorage
export function setApiUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_URL_STORAGE_KEY, url);
}

// Helper to reset API URL to default
export function resetApiUrl(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_URL_STORAGE_KEY);
}

// Helper to get current API URL (for external use)
export function getCurrentApiUrl(): string {
  return getApiUrl();
}
