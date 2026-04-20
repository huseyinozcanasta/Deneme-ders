// Study App Types

export interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  color: string;
  slides: Slide[];
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  subjectId: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  type: 'slide' | 'quiz' | 'spaced';
  startTime: number;
  endTime?: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  subjectId: string;
  date: number;
  taskType: 'study' | 'review' | 'quiz';
  taskId?: string;
  completed: boolean;
}

export interface SpacedRepetitionCard {
  id: string;
  subjectId: string;
  question: string;
  answer: string;
  easeFactor: number;
  interval: number;
  nextReviewDate: number;
  reviewCount: number;
}

export interface StudyStats {
  totalStudyTime: number;
  totalSessions: number;
  quizzesCompleted: number;
  averageQuizScore: number;
  streakDays: number;
  lastStudyDate?: number;
}

export interface StudyAppState {
  subjects: Subject[];
  quizzes: Quiz[];
  studySessions: StudySession[];
  studyPlans: StudyPlan[];
  spacedCards: SpacedRepetitionCard[];
  stats: StudyStats;
}