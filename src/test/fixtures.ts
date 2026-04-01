import type {
  Quiz,
  QuizAttempt,
  UserProfile,
  UserAnswer,
  QuizSession,
  AppAction,
} from '@/types'
import type { Dispatch } from 'react'

// ─── Static data fixtures ──────────────────────────────────────────────────────

export const mockProfile: UserProfile = {
  id: 'user-test-1',
  username: 'testuser',
  createdAt: '2025-01-01T00:00:00.000Z',
}

/** A minimal 2-question quiz — keeps flow tests short while covering "next" logic */
export const mockQuiz: Quiz = {
  id: 'test-quiz',
  title: 'Test Quiz',
  description: 'A quiz used in tests',
  category: 'agent-fundamentals',
  questions: [
    {
      id: 1,
      question: 'What does AI stand for?',
      options: [
        'Artificial Intelligence',
        'Automated Interface',
        'Analog Input',
        'Applied Integration',
      ],
      correctAnswer: 0, // "Artificial Intelligence"
      explanation: 'AI stands for Artificial Intelligence.',
    },
    {
      id: 2,
      question: 'What is a neural network?',
      options: [
        'A social network',
        'A computational model',
        'A type of database',
        'An internet protocol',
      ],
      correctAnswer: 1, // "A computational model"
      explanation: 'A neural network is a computational model inspired by biological neurons.',
    },
  ],
}

export const mockAnswers: UserAnswer[] = [
  { questionId: 1, selectedOption: 0, isCorrect: true, answeredAt: '2025-01-01T10:00:00.000Z' },
  { questionId: 2, selectedOption: 1, isCorrect: true, answeredAt: '2025-01-01T10:01:00.000Z' },
]

export const mockAttempt: QuizAttempt = {
  id: 'attempt-test-1',
  quizId: 'test-quiz',
  quizTitle: 'Test Quiz',
  category: 'agent-fundamentals',
  totalQuestions: 2,
  correctAnswers: 2,
  score: 100,
  feedback: 'Excellent',
  answers: mockAnswers,
  completedAt: '2025-01-01T10:02:00.000Z',
}

export const mockAttempt80: QuizAttempt = {
  ...mockAttempt,
  id: 'attempt-test-2',
  correctAnswers: 4,
  totalQuestions: 5,
  score: 80,
  feedback: 'Excellent',
  completedAt: '2025-01-02T10:00:00.000Z',
}

// ─── Context mock factory ──────────────────────────────────────────────────────

/**
 * Returns a fully-typed mock context value.
 * Override individual fields per test.
 */
export function makeAppContext(overrides: {
  profile?: UserProfile | null
  attempts?: QuizAttempt[]
  quizzes?: Quiz[]
  session?: QuizSession | null
  dispatch?: Dispatch<AppAction>
  login?: (u: string) => void
  logout?: () => void
  addAttempt?: (a: QuizAttempt) => void
  getQuizAttempts?: (id: string) => QuizAttempt[]
  getBestScore?: (id: string) => number | null
  startSession?: (id: string, n: number) => void
  answerQuestion?: (a: UserAnswer) => void
  advanceQuestion?: () => void
  completeSession?: () => void
  resetSession?: () => void
} = {}) {
  return {
    profile: null,
    attempts: [],
    quizzes: [],
    session: null,
    dispatch: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    addAttempt: vi.fn(),
    getQuizAttempts: vi.fn().mockReturnValue([]),
    getBestScore: vi.fn().mockReturnValue(null),
    startSession: vi.fn(),
    answerQuestion: vi.fn(),
    advanceQuestion: vi.fn(),
    completeSession: vi.fn(),
    resetSession: vi.fn(),
    ...overrides,
  }
}
