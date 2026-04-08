import type { StudyAppState } from '@/types/study';

const DB_NAME = 'study-app-db';
const DB_VERSION = 1;
const STORE_NAME = 'app-state';

const initialState: StudyAppState = {
  subjects: [],
  quizzes: [],
  studySessions: [],
  studyPlans: [],
  spacedCards: [],
  stats: {
    totalStudyTime: 0,
    totalSessions: 0,
    quizzesCompleted: 0,
    averageQuizScore: 0,
    streakDays: 0,
  },
};

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveToIndexedDB(state: StudyAppState): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(JSON.stringify(state), 'state');
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

export async function loadFromIndexedDB(): Promise<StudyAppState> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('state');
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      if (request.result) {
        try {
          resolve(JSON.parse(request.result));
        } catch {
          resolve(initialState);
        }
      } else {
        resolve(initialState);
      }
    };
    
    transaction.oncomplete = () => db.close();
  });
}

