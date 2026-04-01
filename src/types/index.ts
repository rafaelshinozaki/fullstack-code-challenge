// ─── Quiz Content ──────────────────────────────────────────────────────────────

export type QuizCategory =
  | 'agent-fundamentals'
  | 'prompt-engineering'
  | 'model-selection'

export interface Question {
  id: number
  question: string
  /** Raw answer strings, 0-indexed */
  options: string[]
  /** 0-based index into options[] that is the correct answer */
  correctAnswer: number
  explanation: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  category: QuizCategory
  questions: Question[]
}

// ─── Active Quiz Session (ephemeral — lives only in React state) ───────────────

export type SessionStatus = 'idle' | 'in-progress' | 'completed'

export interface UserAnswer {
  questionId: number
  selectedOption: number
  isCorrect: boolean
  answeredAt: string // ISO 8601
}

export interface QuizSession {
  quizId: string
  currentQuestionIndex: number
  /** Keyed by question.id */
  answers: Record<number, UserAnswer>
  status: SessionStatus
  startedAt: string // ISO 8601
}

// ─── Persisted Records ─────────────────────────────────────────────────────────

export type FeedbackLabel = 'Excellent' | 'Good job!' | 'Keep practicing' | 'Needs review'

export interface QuizAttempt {
  id: string // uuid-like, generated at completion time
  quizId: string
  quizTitle: string
  category: QuizCategory
  totalQuestions: number
  correctAnswers: number
  /** 0–100 percentage, rounded to nearest integer */
  score: number
  feedback: FeedbackLabel
  answers: UserAnswer[]
  completedAt: string // ISO 8601
}

export interface UserProfile {
  id: string
  username: string
  createdAt: string // ISO 8601
}

// ─── Derived / aggregate helpers (computed from attempts, not stored) ──────────

export interface UserStats {
  totalQuizzesCompleted: number
  totalQuestionsAnswered: number
  averageScore: number
  bestScore: number
}

// ─── localStorage store shapes ─────────────────────────────────────────────────

export interface StoredUser {
  profile: UserProfile
  attempts: QuizAttempt[]
}

// ─── Global App State (React Context shape) ───────────────────────────────────

export interface AppState {
  /** Available quizzes loaded from the mock API */
  quizzes: Quiz[]
  /** Currently authenticated / identified user */
  profile: UserProfile | null
  /** Full attempt history for the current user */
  attempts: QuizAttempt[]
  /** Live quiz session — null when no quiz is active */
  session: QuizSession | null
}

export type AppAction =
  | { type: 'SET_QUIZZES'; payload: Quiz[] }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'SET_ATTEMPTS'; payload: QuizAttempt[] }
  | { type: 'START_SESSION'; payload: QuizSession }
  | { type: 'ANSWER_QUESTION'; payload: UserAnswer }
  | { type: 'ADVANCE_QUESTION' }
  | { type: 'COMPLETE_SESSION' }
  | { type: 'RESET_SESSION' }
  | { type: 'SAVE_ATTEMPT'; payload: QuizAttempt }
  | { type: 'CLEAR_DATA' }
