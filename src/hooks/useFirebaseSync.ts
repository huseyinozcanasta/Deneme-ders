import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  Subject, 
  Quiz, 
  QuizQuestion,
  StudyPlan,
  SpacedRepetitionCard,
  StudySession,
  StudyStats 
} from '@/types/study';

// Firestore collection names
const COLLECTIONS = {
  USERS: 'users',
  SUBJECTS: 'subjects',
  QUIZZES: 'quizzes',
  STUDY_PLANS: 'studyPlans',
  SPACED_CARDS: 'spacedCards',
  STUDY_SESSIONS: 'studySessions',
} as const;

export function useFirebaseSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // User profile queries and mutations
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const docRef = doc(db, COLLECTIONS.USERS, user.uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },
    enabled: !!user?.uid,
  });

  const upsertUserMutation = useMutation({
    mutationFn: async (userData: Partial<StudyStats> & { preferences?: any }) => {
      if (!user?.uid) throw new Error('User not authenticated');
      const docRef = doc(db, COLLECTIONS.USERS, user.uid);
      const data = {
        ...userData,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  // Subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const q = query(
        collection(db, COLLECTIONS.SUBJECTS),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!user?.uid,
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (subjectData: Omit<Subject, 'id' | 'slides'>) => {
      if (!user?.uid) throw new Error('User not authenticated');
      const data = {
        ...subjectData,
        userId: user.uid,
        slideCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, COLLECTIONS.SUBJECTS), data);
      return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Subject> }) => {
      const docRef = doc(db, COLLECTIONS.SUBJECTS, id);
      const data = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, COLLECTIONS.SUBJECTS, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Quizzes
  const { data: quizzes } = useQuery({
    queryKey: ['quizzes', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const q = query(
        collection(db, COLLECTIONS.QUIZZES),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!user?.uid,
  });

  const createQuizMutation = useMutation({
    mutationFn: async (quizData: Omit<Quiz, 'id'>) => {
      if (!user?.uid) throw new Error('User not authenticated');
      const data = {
        ...quizData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, COLLECTIONS.QUIZZES), data);
      return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Quiz> }) => {
      const docRef = doc(db, COLLECTIONS.QUIZZES, id);
      const data = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, COLLECTIONS.QUIZZES, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });

  // Study Plans
  const { data: studyPlans } = useQuery({
    queryKey: ['studyPlans', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const q = query(
        collection(db, COLLECTIONS.STUDY_PLANS),
        where('userId', '==', user.uid),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!user?.uid,
  });

  const createStudyPlanMutation = useMutation({
    mutationFn: async (planData: Omit<StudyPlan, 'id'>) => {
      if (!user?.uid) throw new Error('User not authenticated');
      const data = {
        ...planData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, COLLECTIONS.STUDY_PLANS), data);
      return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyPlans'] });
    },
  });

  const updateStudyPlanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StudyPlan> }) => {
      const docRef = doc(db, COLLECTIONS.STUDY_PLANS, id);
      const data = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyPlans'] });
    },
  });

  // Spaced Repetition Cards
  const { data: spacedCards } = useQuery({
    queryKey: ['spacedCards', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const q = query(
        collection(db, COLLECTIONS.SPACED_CARDS),
        where('userId', '==', user.uid),
        orderBy('nextReviewDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!user?.uid,
  });

  const createSpacedCardMutation = useMutation({
    mutationFn: async (cardData: Omit<SpacedRepetitionCard, 'id'>) => {
      if (!user?.uid) throw new Error('User not authenticated');
      const data = {
        ...cardData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, COLLECTIONS.SPACED_CARDS), data);
      return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spacedCards'] });
    },
  });

  const updateSpacedCardMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SpacedRepetitionCard> }) => {
      const docRef = doc(db, COLLECTIONS.SPACED_CARDS, id);
      const data = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spacedCards'] });
    },
  });

  // Study Sessions
  const { data: studySessions } = useQuery({
    queryKey: ['studySessions', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const q = query(
        collection(db, COLLECTIONS.STUDY_SESSIONS),
        where('userId', '==', user.uid),
        orderBy('startTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!user?.uid,
  });

  const createStudySessionMutation = useMutation({
    mutationFn: async (sessionData: Omit<StudySession, 'id'>) => {
      if (!user?.uid) throw new Error('User not authenticated');
      const data = {
        ...sessionData,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, COLLECTIONS.STUDY_SESSIONS), data);
      return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
    },
  });

  const updateStudySessionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StudySession> }) => {
      const docRef = doc(db, COLLECTIONS.STUDY_SESSIONS, id);
      const data = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
    },
  });

  // Helper functions to convert between local and Firebase formats
  const convertSubjectFromFirebase = (fbSubject: any): Subject => ({
    id: fbSubject.id,
    name: fbSubject.name,
    description: fbSubject.description || undefined,
    color: fbSubject.color,
    slides: [], // Slides are stored locally only
    createdAt: (fbSubject.createdAt && typeof fbSubject.createdAt.toMillis === 'function') ? fbSubject.createdAt.toMillis() : Date.now(),
  });

  const convertSubjectToFirebase = (subject: Subject) => ({
    name: subject.name,
    description: subject.description || null,
    color: subject.color,
    slideCount: subject.slides.length,
  });

  const convertQuizFromFirebase = (fbQuiz: any): Quiz => ({
    id: fbQuiz.id,
    subjectId: fbQuiz.subjectId,
    title: fbQuiz.title,
    questions: fbQuiz.questions as QuizQuestion[],
    createdAt: fbQuiz.createdAt?.toMillis() || Date.now(),
  });

  const convertQuizToFirebase = (quiz: Quiz) => ({
    subjectId: quiz.subjectId,
    title: quiz.title,
    questions: quiz.questions,
  });

  const convertStudyPlanFromFirebase = (fbPlan: any): StudyPlan => ({
    id: fbPlan.id,
    subjectId: fbPlan.subjectId,
    date: fbPlan.date?.toMillis() || Date.now(),
    taskType: fbPlan.taskType as 'study' | 'review' | 'quiz',
    taskId: fbPlan.taskId || undefined,
    completed: fbPlan.completed,
  });

  const convertStudyPlanToFirebase = (plan: StudyPlan) => ({
    subjectId: plan.subjectId,
    date: Timestamp.fromMillis(plan.date),
    taskType: plan.taskType,
    taskId: plan.taskId || null,
    completed: plan.completed,
  });

  const convertSpacedCardFromFirebase = (fbCard: any): SpacedRepetitionCard => ({
    id: fbCard.id,
    subjectId: fbCard.subjectId,
    question: fbCard.question,
    answer: fbCard.answer,
    easeFactor: fbCard.easeFactor,
    interval: fbCard.interval,
    nextReviewDate: fbCard.nextReviewDate?.toMillis() || Date.now(),
    reviewCount: fbCard.reviewCount,
  });

  const convertSpacedCardToFirebase = (card: SpacedRepetitionCard) => ({
    subjectId: card.subjectId,
    question: card.question,
    answer: card.answer,
    easeFactor: card.easeFactor,
    interval: card.interval,
    nextReviewDate: Timestamp.fromMillis(card.nextReviewDate),
    reviewCount: card.reviewCount,
  });

  const convertStudySessionFromFirebase = (fbSession: any): StudySession => ({
    id: fbSession.id,
    subjectId: fbSession.subjectId,
    type: fbSession.type as 'slide' | 'quiz' | 'spaced',
    startTime: fbSession.startTime?.toMillis() || Date.now(),
    endTime: fbSession.endTime?.toMillis() || undefined,
    completed: fbSession.completed,
  });

  const convertStudySessionToFirebase = (session: StudySession) => ({
    subjectId: session.subjectId,
    type: session.type,
    startTime: Timestamp.fromMillis(session.startTime),
    endTime: session.endTime ? Timestamp.fromMillis(session.endTime) : null,
    completed: session.completed,
  });

  const convertStatsFromFirebase = (fbUser: any): StudyStats => ({
    totalStudyTime: fbUser.totalStudyTime || 0,
    totalSessions: fbUser.totalSessions || 0,
    quizzesCompleted: fbUser.quizzesCompleted || 0,
    averageQuizScore: fbUser.averageQuizScore || 0,
    streakDays: fbUser.streakDays || 0,
    lastStudyDate: fbUser.lastStudyDate?.toMillis() || undefined,
  });

  return {
    // Data
    userProfile,
    subjects,
    quizzes,
    studyPlans,
    spacedCards,
    studySessions,

    // Mutations
    createSubjectMutation,
    updateSubjectMutation,
    deleteSubjectMutation,
    createQuizMutation,
    updateQuizMutation,
    deleteQuizMutation,
    createStudyPlanMutation,
    updateStudyPlanMutation,
    createSpacedCardMutation,
    updateSpacedCardMutation,
    createStudySessionMutation,
    updateStudySessionMutation,
    upsertUserMutation,

    // Converters
    convertSubjectFromFirebase,
    convertSubjectToFirebase,
    convertQuizFromFirebase,
    convertQuizToFirebase,
    convertStudyPlanFromFirebase,
    convertStudyPlanToFirebase,
    convertSpacedCardFromFirebase,
    convertSpacedCardToFirebase,
    convertStudySessionFromFirebase,
    convertStudySessionToFirebase,
    convertStatsFromFirebase,
  };
}
