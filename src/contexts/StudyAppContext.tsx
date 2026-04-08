import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { 
  StudyAppState, 
  Subject, 
  Slide, 
  Quiz, 
  QuizQuestion,
  StudySession,
  StudyPlan,
  SpacedRepetitionCard,
  StudyStats 
} from '@/types/study';

const initialStats: StudyStats = {
  totalStudyTime: 0,
  totalSessions: 0,
  quizzesCompleted: 0,
  averageQuizScore: 0,
  streakDays: 0,
};

const initialState: StudyAppState = {
  subjects: [],
  quizzes: [],
  studySessions: [],
  studyPlans: [],
  spacedCards: [],
  stats: initialStats,
};

interface StudyAppContextType {
  state: StudyAppState;
  addSubject: (name: string, description?: string, color?: string) => Subject;
  addSlide: (subjectId: string, slide: Omit<Slide, 'id'>) => Slide;
  updateSlide: (subjectId: string, slideId: string, updates: Partial<Slide>) => void;
  deleteSlide: (subjectId: string, slideId: string) => void;
  addQuiz: (subjectId: string, title: string, questions: Omit<QuizQuestion, 'id'>[]) => Quiz;
  addStudyPlan: (subjectId: string, date: number, taskType: StudyPlan['taskType'], taskId?: string) => StudyPlan;
  toggleStudyPlan: (planId: string) => void;
  addStudySession: (subjectId: string, type: StudySession['type']) => StudySession;
  completeSession: (sessionId: string, duration: number) => void;
  addSpacedCard: (subjectId: string, question: string, answer: string) => SpacedRepetitionCard;
  reviewSpacedCard: (cardId: string, quality: number) => void;
  deleteSubject: (subjectId: string) => void;
  deleteQuiz: (quizId: string) => void;
  isStorageReady: boolean;
}

const StudyAppContext = createContext<StudyAppContextType | undefined>(undefined);

const DB_NAME = 'study-app-db';
const DB_VERSION = 1;
const STORE_NAME = 'app-state';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// IndexedDB helpers
function openDB(): Promise<IDBDatabase> {
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

async function saveToIndexedDB(state: StudyAppState): Promise<void> {
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

async function loadFromIndexedDB(): Promise<StudyAppState> {
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

// Compress image data URL for storage efficiency
async function compressImage(dataUrl: string, quality = 0.6): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 1200; // Max width for storage
      const scale = Math.min(1, maxWidth / img.width);
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function StudyAppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyAppState>(initialState);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  // Load from IndexedDB on mount
  useEffect(() => {
    loadFromIndexedDB()
      .then((savedState) => {
        setState(savedState);
        setIsStorageReady(true);
      })
      .catch((error) => {
        console.error('Failed to load from IndexedDB:', error);
        setIsStorageReady(true);
      });
  }, []);

  // Debounced save to IndexedDB
  useEffect(() => {
    if (!isStorageReady) return;
    
    setPendingSave(true);
    const timeoutId = setTimeout(async () => {
      if (pendingSave) {
        try {
          await saveToIndexedDB(state);
        } catch (error) {
          console.error('Failed to save to IndexedDB:', error);
        }
        setPendingSave(false);
      }
    }, 500); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [state, isStorageReady]);

  const addSubject = useCallback((name: string, description?: string, color = '#6366f1'): Subject => {
    const subject: Subject = {
      id: generateId(),
      name,
      description,
      color,
      slides: [],
      createdAt: Date.now(),
    };
    setState(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
    return subject;
  }, []);

  const addSlide = useCallback(async (subjectId: string, slide: Omit<Slide, 'id'>): Promise<Slide> => {
    const newSlide: Slide = { ...slide, id: generateId() };
    
    // Compress image if present to save storage space
    if (newSlide.imageUrl && newSlide.imageUrl.startsWith('data:image')) {
      newSlide.imageUrl = await compressImage(newSlide.imageUrl, 0.6);
    }
    
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s.id === subjectId ? { ...s, slides: [...s.slides, newSlide] } : s
      ),
    }));
    return newSlide;
  }, []);

  const updateSlide = useCallback(async (subjectId: string, slideId: string, updates: Partial<Slide>) => {
    // Compress image if updating imageUrl
    let processedUpdates = updates;
    if (updates.imageUrl && updates.imageUrl.startsWith('data:image')) {
      processedUpdates = {
        ...updates,
        imageUrl: await compressImage(updates.imageUrl, 0.6)
      };
    }
    
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s.id === subjectId ? {
          ...s,
          slides: s.slides.map(sl => sl.id === slideId ? { ...sl, ...processedUpdates } : sl)
        } : s
      ),
    }));
  }, []);

  const deleteSlide = useCallback((subjectId: string, slideId: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s.id === subjectId ? { ...s, slides: s.slides.filter(sl => sl.id !== slideId) } : s
      ),
    }));
  }, []);

  const addQuiz = useCallback((subjectId: string, title: string, questions: Omit<QuizQuestion, 'id'>[]): Quiz => {
    const quiz: Quiz = {
      id: generateId(),
      subjectId,
      title,
      questions: questions.map(q => ({ ...q, id: generateId() })),
      createdAt: Date.now(),
    };
    setState(prev => ({ ...prev, quizzes: [...prev.quizzes, quiz] }));
    return quiz;
  }, []);

  const addStudyPlan = useCallback((subjectId: string, date: number, taskType: StudyPlan['taskType'], taskId?: string): StudyPlan => {
    const plan: StudyPlan = {
      id: generateId(),
      subjectId,
      date,
      taskType,
      taskId,
      completed: false,
    };
    setState(prev => ({ ...prev, studyPlans: [...prev.studyPlans, plan] }));
    return plan;
  }, []);

  const toggleStudyPlan = useCallback((planId: string) => {
    setState(prev => ({
      ...prev,
      studyPlans: prev.studyPlans.map(p => 
        p.id === planId ? { ...p, completed: !p.completed } : p
      ),
    }));
  }, []);

  const addStudySession = useCallback((subjectId: string, type: StudySession['type']): StudySession => {
    const session: StudySession = {
      id: generateId(),
      subjectId,
      type,
      startTime: Date.now(),
      completed: false,
    };
    setState(prev => ({ ...prev, studySessions: [...prev.studySessions, session] }));
    return session;
  }, []);

  const completeSession = useCallback((sessionId: string, duration: number) => {
    setState(prev => {
      const now = Date.now();
      const lastStudyDate = prev.stats.lastStudyDate;
      const dayInMs = 24 * 60 * 60 * 1000;
      const yesterday = now - dayInMs;
      
      let streakDays = prev.stats.streakDays;
      if (!lastStudyDate || lastStudyDate < yesterday) {
        if (lastStudyDate && lastStudyDate >= yesterday) {
          streakDays = prev.stats.streakDays + 1;
        } else {
          streakDays = 1;
        }
      }

      return {
        ...prev,
        studySessions: prev.studySessions.map(s => 
          s.id === sessionId ? { ...s, endTime: now, completed: true } : s
        ),
        stats: {
          ...prev.stats,
          totalStudyTime: prev.stats.totalStudyTime + duration,
          totalSessions: prev.stats.totalSessions + 1,
          streakDays,
          lastStudyDate: now,
        },
      };
    });
  }, []);

  const addSpacedCard = useCallback((subjectId: string, question: string, answer: string): SpacedRepetitionCard => {
    const card: SpacedRepetitionCard = {
      id: generateId(),
      subjectId,
      question,
      answer,
      easeFactor: 2.5,
      interval: 1,
      nextReviewDate: Date.now(),
      reviewCount: 0,
    };
    setState(prev => ({ ...prev, spacedCards: [...prev.spacedCards, card] }));
    return card;
  }, []);

  const reviewSpacedCard = useCallback((cardId: string, quality: number) => {
    setState(prev => ({
      ...prev,
      spacedCards: prev.spacedCards.map(card => {
        if (card.id !== cardId) return card;

        let { easeFactor, interval } = card;
        
        if (quality >= 3) {
          if (card.reviewCount === 0) {
            interval = 1;
          } else if (card.reviewCount === 1) {
            interval = 6;
          } else {
            interval = Math.round(interval * easeFactor);
          }
        } else {
          interval = 1;
        }

        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

        const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

        return {
          ...card,
          easeFactor,
          interval,
          nextReviewDate,
          reviewCount: card.reviewCount + 1,
        };
      }),
    }));
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== subjectId),
      quizzes: prev.quizzes.filter(q => q.subjectId !== subjectId),
      studyPlans: prev.studyPlans.filter(p => p.subjectId !== subjectId),
      spacedCards: prev.spacedCards.filter(c => c.subjectId !== subjectId),
    }));
  }, []);

  const deleteQuiz = useCallback((quizId: string) => {
    setState(prev => ({
      ...prev,
      quizzes: prev.quizzes.filter(q => q.id !== quizId),
    }));
  }, []);

  return (
    <StudyAppContext.Provider value={{
      state,
      addSubject,
      addSlide,
      updateSlide,
      deleteSlide,
      addQuiz,
      addStudyPlan,
      toggleStudyPlan,
      addStudySession,
      completeSession,
      addSpacedCard,
      reviewSpacedCard,
      deleteSubject,
      deleteQuiz,
      isStorageReady,
    }}>
      {children}
    </StudyAppContext.Provider>
  );
}

export function useStudyApp() {
  const context = useContext(StudyAppContext);
  if (!context) {
    throw new Error('useStudyApp must be used within StudyAppProvider');
  }
  return context;
}
