// ─── Quiz Content ─────────────────────────────────────────────────────────────

/** A single answer option within a question (index-matched to options array). */
export interface QuizQuestion {
  id: number
  question: string
  /** Exactly 4 options; index matches correctAnswer. */
  options: [string, string, string, string]
  /** Zero-based index of the correct option. */
  correctAnswer: number
  explanation: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
}

/** Lightweight summary shown on the home / category selection screen. */
export interface QuizCategory {
  id: string
  title: string
  description: string
  questionCount: number
  /** False while a quiz is being authored / not yet ready. */
  available: boolean
  /** Optional accent colour key used for card theming. */
  colorKey: 'primary' | 'success' | 'warning' | 'danger'
}

// ─── Quiz Session (runtime, not persisted) ────────────────────────────────────

/** One answer recorded during an active session. */
export interface AnswerRecord {
  questionId: number
  selectedOption: number
  isCorrect: boolean
}

/** Live state while a user is taking a quiz. */
export interface QuizSession {
  quizId: string
  answers: AnswerRecord[]
  /** Zero-based index of the question currently displayed. */
  currentQuestionIndex: number
  startedAt: string // ISO-8601
  isComplete: boolean
}

// ─── Persistence ──────────────────────────────────────────────────────────────

/** Immutable record of a completed quiz run, written to localStorage. */
export interface QuizAttempt {
  /** Unique attempt identifier (crypto.randomUUID or Date.now string). */
  id: string
  quizId: string
  quizTitle: string
  score: number
  total: number
  percentage: number
  answers: AnswerRecord[]
  completedAt: string // ISO-8601
}

/** Persisted user profile. Created on first visit. */
export interface UserProfile {
  username: string
  createdAt: string // ISO-8601
  attempts: QuizAttempt[]
}

// ─── Scoring Helpers ──────────────────────────────────────────────────────────

export type FeedbackLevel = 'perfect' | 'excellent' | 'good' | 'keep-practicing' | 'needs-review'

export interface ScoreResult {
  score: number
  total: number
  percentage: number
  feedbackLevel: FeedbackLevel
  feedbackLabel: string
}
