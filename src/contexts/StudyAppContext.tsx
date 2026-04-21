import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
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

// Local-only state for slides
interface LocalSlideState {
  [subjectId: string]: Slide[];
}

interface StudyAppContextType {
  state: StudyAppState;
  addSubject: (name: string, description?: string, color?: string) => Promise<Subject>;
  addSlide: (subjectId: string, slide: Omit<Slide, 'id'>) => Promise<Slide>;
  updateSlide: (subjectId: string, slideId: string, updates: Partial<Slide>) => Promise<void>;
  deleteSlide: (subjectId: string, slideId: string) => void;
  addQuiz: (subjectId: string, title: string, questions: Omit<QuizQuestion, 'id'>[]) => Promise<Quiz>;
  addStudyPlan: (subjectId: string, date: number, taskType: StudyPlan['taskType'], taskId?: string) => Promise<StudyPlan>;
  toggleStudyPlan: (planId: string) => Promise<void>;
  addStudySession: (subjectId: string, type: StudySession['type']) => Promise<StudySession>;
  completeSession: (sessionId: string, duration: number) => Promise<void>;
  addSpacedCard: (subjectId: string, question: string, answer: string) => Promise<SpacedRepetitionCard>;
  reviewSpacedCard: (cardId: string, quality: number) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  deleteQuiz: (quizId: string) => Promise<void>;
  isStorageReady: boolean;
  isFirebaseSynced: boolean;
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
  const { user } = useAuth();
  const firebaseSync = useFirebaseSync();
  const [state, setState] = useState<StudyAppState>(initialState);
  const [localSlideState, setLocalSlideState] = useState<LocalSlideState>({});
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  // Load from IndexedDB on mount (slides only)
  useEffect(() => {
    loadFromIndexedDB()
      .then((savedState) => {
        // Extract slides and store them locally
        const slidesBySubject: LocalSlideState = {};
        savedState.subjects.forEach(subject => {
          if (subject.slides.length > 0) {
            slidesBySubject[subject.id] = subject.slides;
          }
        });
        setLocalSlideState(slidesBySubject);
        
        // Set initial state without slides (they'll come from Firebase)
        setState(prev => ({
          ...prev,
          subjects: savedState.subjects.map(s => ({ ...s, slides: [] }))
        }));
        setIsStorageReady(true);
      })
      .catch((error) => {
        console.error('Failed to load from IndexedDB:', error);
        setIsStorageReady(true);
      });
  }, []);

  // Sync with Firebase when user is authenticated
  useEffect(() => {
    if (!user || !isStorageReady) return;

    let isMounted = true;
    const syncData = async () => {
      try {
        // Use setTimeout to prevent blocking the main thread
        await new Promise(resolve => setTimeout(resolve, 0));
        
        if (!isMounted) return;

        // Wait for Firebase data to load with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase sync timeout')), 10000)
        );
        
        const dataPromise = Promise.all([
          firebaseSync.subjects || Promise.resolve([]),
          firebaseSync.quizzes || Promise.resolve([]),
          firebaseSync.studyPlans || Promise.resolve([]),
          firebaseSync.spacedCards || Promise.resolve([]),
          firebaseSync.studySessions || Promise.resolve([]),
          firebaseSync.userProfile || Promise.resolve(null),
        ]);

        const [fbSubjects, fbQuizzes, fbStudyPlans, fbSpacedCards, fbStudySessions, fbUserProfile] = 
          await Promise.race([dataPromise, timeoutPromise]) as [any, any, any, any, any, any];

        if (!isMounted) return;

        // Convert Firebase data to local format
        const convertedSubjects = fbSubjects?.map(firebaseSync.convertSubjectFromFirebase) || [];
        const convertedQuizzes = fbQuizzes?.map(firebaseSync.convertQuizFromFirebase) || [];
        const convertedStudyPlans = fbStudyPlans?.map(firebaseSync.convertStudyPlanFromFirebase) || [];
        const convertedSpacedCards = fbSpacedCards?.map(firebaseSync.convertSpacedCardFromFirebase) || [];
        const convertedStudySessions = fbStudySessions?.map(firebaseSync.convertStudySessionFromFirebase) || [];
        const convertedStats = fbUserProfile ? firebaseSync.convertStatsFromFirebase(fbUserProfile) : initialStats;

        // Merge with local slides
        const subjectsWithSlides = convertedSubjects.map(subject => ({
          ...subject,
          slides: localSlideState[subject.id] || []
        }));

        setState({
          subjects: subjectsWithSlides,
          quizzes: convertedQuizzes,
          studyPlans: convertedStudyPlans,
          spacedCards: convertedSpacedCards,
          studySessions: convertedStudySessions,
          stats: convertedStats,
        });

        setIsFirebaseSynced(true);
      } catch (error) {
        if (isMounted) {
          console.error('Failed to sync with Firebase:', error);
          setIsFirebaseSynced(false);
        }
      }
    };

    syncData();
    
    return () => {
      isMounted = false;
    };
  }, [user, isStorageReady, localSlideState]);

  // Debounced save to IndexedDB (slides only)
  const pendingSaveRef = useRef(pendingSave);
  pendingSaveRef.current = pendingSave;

  useEffect(() => {
    if (!isStorageReady) return;
    
    setPendingSave(true);
    const timeoutId = setTimeout(async () => {
      if (pendingSaveRef.current) {
        try {
          // Save only slides to IndexedDB
          const stateWithSlides = {
            ...state,
            subjects: state.subjects.map(subject => ({
              ...subject,
              slides: localSlideState[subject.id] || []
            }))
          };
          await saveToIndexedDB(stateWithSlides);
        } catch (error) {
          console.error('Failed to save to IndexedDB:', error);
        }
        setPendingSave(false);
      }
    }, 500); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [state, localSlideState, isStorageReady]);

  const addSubject = useCallback(async (name: string, description?: string, color = '#6366f1'): Promise<Subject> => {
    if (!user) {
      // Fallback to local-only mode
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
    }

    try {
      const subjectData = {
        name,
        description: description || undefined,
        color,
        createdAt: Date.now(),
      };
      
      const result = await firebaseSync.createSubjectMutation.mutateAsync(subjectData);
      const subject = firebaseSync.convertSubjectFromFirebase(result);
      
      setState(prev => ({ ...prev, subjects: [...prev.subjects, { ...subject, slides: [] }] }));
      return subject;
    } catch (error) {
      console.error('Failed to create subject in Firebase:', error);
      // Fallback to local
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
    }
  }, [user, firebaseSync]);

  const addSlide = useCallback(async (subjectId: string, slide: Omit<Slide, 'id'>): Promise<Slide> => {
    const newSlide: Slide = { ...slide, id: generateId() };
    
    // Compress image if present to save storage space
    if (newSlide.imageUrl && newSlide.imageUrl.startsWith('data:image')) {
      newSlide.imageUrl = await compressImage(newSlide.imageUrl, 0.6);
    }
    
    // Store slide locally only
    setLocalSlideState(prev => ({
      ...prev,
      [subjectId]: [...(prev[subjectId] || []), newSlide]
    }));
    
    // Update state to reflect the new slide
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s.id === subjectId ? { ...s, slides: [...(s.slides || []), newSlide] } : s
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
    
    // Update local slide storage
    setLocalSlideState(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).map(sl => 
        sl.id === slideId ? { ...sl, ...processedUpdates } : sl
      )
    }));
    
    // Update state to reflect the change
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s.id === subjectId ? {
          ...s,
          slides: (s.slides || []).map(sl => sl.id === slideId ? { ...sl, ...processedUpdates } : sl)
        } : s
      ),
    }));
  }, []);

  const deleteSlide = useCallback((subjectId: string, slideId: string) => {
    // Update local slide storage
    setLocalSlideState(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).filter(sl => sl.id !== slideId)
    }));
    
    // Update state to reflect the deletion
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => 
        s.id === subjectId ? { ...s, slides: (s.slides || []).filter(sl => sl.id !== slideId) } : s
      ),
    }));
  }, []);

  const addQuiz = useCallback(async (subjectId: string, title: string, questions: Omit<QuizQuestion, 'id'>[]): Promise<Quiz> => {
    if (!user) {
      // Fallback to local-only mode
      const quiz: Quiz = {
        id: generateId(),
        subjectId,
        title,
        questions: questions.map(q => ({ ...q, id: generateId() })),
        createdAt: Date.now(),
      };
      setState(prev => ({ ...prev, quizzes: [...prev.quizzes, quiz] }));
      return quiz;
    }

    try {
      const quizData = {
        subjectId,
        title,
        questions: questions.map(q => ({ ...q, id: generateId() })),
        createdAt: Date.now(),
      };
      
      const result = await firebaseSync.createQuizMutation.mutateAsync(quizData);
      const quiz = firebaseSync.convertQuizFromFirebase(result);
      
      setState(prev => ({ ...prev, quizzes: [...prev.quizzes, quiz] }));
      return quiz;
    } catch (error) {
      console.error('Failed to create quiz in Firebase:', error);
      // Fallback to local
      const quiz: Quiz = {
        id: generateId(),
        subjectId,
        title,
        questions: questions.map(q => ({ ...q, id: generateId() })),
        createdAt: Date.now(),
      };
      setState(prev => ({ ...prev, quizzes: [...prev.quizzes, quiz] }));
      return quiz;
    }
  }, [user, firebaseSync]);

  const addStudyPlan = useCallback(async (subjectId: string, date: number, taskType: StudyPlan['taskType'], taskId?: string): Promise<StudyPlan> => {
    if (!user) {
      // Fallback to local-only mode
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
    }

    try {
      const planData = {
        subjectId,
        date,
        taskType,
        taskId: taskId || undefined,
        completed: false,
      };
      
      const result = await firebaseSync.createStudyPlanMutation.mutateAsync(planData);
      const plan = firebaseSync.convertStudyPlanFromFirebase(result);
      
      setState(prev => ({ ...prev, studyPlans: [...prev.studyPlans, plan] }));
      return plan;
    } catch (error) {
      console.error('Failed to create study plan in Firebase:', error);
      // Fallback to local
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
    }
  }, [user, firebaseSync]);

  const toggleStudyPlan = useCallback(async (planId: string) => {
    const plan = state.studyPlans.find(p => p.id === planId);
    if (!plan) return;

    const updatedPlan = { ...plan, completed: !plan.completed };

    if (user) {
      try {
        await firebaseSync.updateStudyPlanMutation.mutateAsync({ 
          id: planId, 
          updates: { completed: updatedPlan.completed } 
        });
      } catch (error) {
        console.error('Failed to update study plan in Firebase:', error);
      }
    }

    setState(prev => ({
      ...prev,
      studyPlans: prev.studyPlans.map(p => 
        p.id === planId ? updatedPlan : p
      ),
    }));
  }, [user, firebaseSync, state.studyPlans]);

  const addStudySession = useCallback(async (subjectId: string, type: StudySession['type']): Promise<StudySession> => {
    if (!user) {
      // Fallback to local-only mode
      const session: StudySession = {
        id: generateId(),
        subjectId,
        type,
        startTime: Date.now(),
        completed: false,
      };
      setState(prev => ({ ...prev, studySessions: [...prev.studySessions, session] }));
      return session;
    }

    try {
      const sessionData = {
        subjectId,
        type,
        startTime: Date.now(),
        completed: false,
      };
      
      const result = await firebaseSync.createStudySessionMutation.mutateAsync(sessionData);
      const session = firebaseSync.convertStudySessionFromFirebase(result);
      
      setState(prev => ({ ...prev, studySessions: [...prev.studySessions, session] }));
      return session;
    } catch (error) {
      console.error('Failed to create study session in Firebase:', error);
      // Fallback to local
      const session: StudySession = {
        id: generateId(),
        subjectId,
        type,
        startTime: Date.now(),
        completed: false,
      };
      setState(prev => ({ ...prev, studySessions: [...prev.studySessions, session] }));
      return session;
    }
  }, [user, firebaseSync]);

  const completeSession = useCallback(async (sessionId: string, duration: number) => {
    const now = Date.now();
    const session = state.studySessions.find(s => s.id === sessionId);
    if (!session) return;

    const lastStudyDate = state.stats.lastStudyDate;
    const dayInMs = 24 * 60 * 60 * 1000;
    const yesterday = now - dayInMs;
    
    let streakDays = state.stats.streakDays;
    if (!lastStudyDate || lastStudyDate < yesterday) {
      if (lastStudyDate && lastStudyDate >= yesterday) {
        streakDays = state.stats.streakDays + 1;
      } else {
        streakDays = 1;
      }
    }

    const updatedSession = { ...session, endTime: now, completed: true };
    const updatedStats = {
      ...state.stats,
      totalStudyTime: state.stats.totalStudyTime + duration,
      totalSessions: state.stats.totalSessions + 1,
      streakDays,
      lastStudyDate: now,
    };

    if (user) {
      try {
        await firebaseSync.updateStudySessionMutation.mutateAsync({ 
          id: sessionId, 
          updates: updatedSession 
        });
        await firebaseSync.upsertUserMutation.mutateAsync(updatedStats);
      } catch (error) {
        console.error('Failed to update session/stats in Firebase:', error);
      }
    }

    setState(prev => ({
      ...prev,
      studySessions: prev.studySessions.map(s => 
        s.id === sessionId ? updatedSession : s
      ),
      stats: updatedStats,
    }));
  }, [user, firebaseSync, state.studySessions, state.stats]);

  const addSpacedCard = useCallback(async (subjectId: string, question: string, answer: string): Promise<SpacedRepetitionCard> => {
    if (!user) {
      // Fallback to local-only mode
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
    }

    try {
      const cardData = {
        subjectId,
        question,
        answer,
        easeFactor: 2.5,
        interval: 1,
        nextReviewDate: Date.now(),
        reviewCount: 0,
      };
      
      const result = await firebaseSync.createSpacedCardMutation.mutateAsync(cardData);
      const card = firebaseSync.convertSpacedCardFromFirebase(result);
      
      setState(prev => ({ ...prev, spacedCards: [...prev.spacedCards, card] }));
      return card;
    } catch (error) {
      console.error('Failed to create spaced card in Firebase:', error);
      // Fallback to local
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
    }
  }, [user, firebaseSync]);

  const reviewSpacedCard = useCallback(async (cardId: string, quality: number) => {
    const card = state.spacedCards.find(c => c.id === cardId);
    if (!card) return;

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
    const updatedCard = {
      ...card,
      easeFactor,
      interval,
      nextReviewDate,
      reviewCount: card.reviewCount + 1,
    };

    if (user) {
      try {
        await firebaseSync.updateSpacedCardMutation.mutateAsync({ 
          id: cardId, 
          updates: updatedCard 
        });
      } catch (error) {
        console.error('Failed to update spaced card in Firebase:', error);
      }
    }

    setState(prev => ({
      ...prev,
      spacedCards: prev.spacedCards.map(c => 
        c.id === cardId ? updatedCard : c
      ),
    }));
  }, [user, firebaseSync, state.spacedCards]);

  const deleteSubject = useCallback(async (subjectId: string) => {
    if (user) {
      try {
        await firebaseSync.deleteSubjectMutation.mutateAsync(subjectId);
      } catch (error) {
        console.error('Failed to delete subject from Firebase:', error);
      }
    }

    // Also clean up local slides
    setLocalSlideState(prev => {
      const newState = { ...prev };
      delete newState[subjectId];
      return newState;
    });

    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== subjectId),
      quizzes: prev.quizzes.filter(q => q.subjectId !== subjectId),
      studyPlans: prev.studyPlans.filter(p => p.subjectId !== subjectId),
      spacedCards: prev.spacedCards.filter(c => c.subjectId !== subjectId),
    }));
  }, [user, firebaseSync]);

  const deleteQuiz = useCallback(async (quizId: string) => {
    if (user) {
      try {
        await firebaseSync.deleteQuizMutation.mutateAsync(quizId);
      } catch (error) {
        console.error('Failed to delete quiz from Firebase:', error);
      }
    }

    setState(prev => ({
      ...prev,
      quizzes: prev.quizzes.filter(q => q.id !== quizId),
    }));
  }, [user, firebaseSync]);

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
      isFirebaseSynced,
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
