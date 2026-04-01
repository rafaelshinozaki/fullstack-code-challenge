import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react'
import type {
  AppState,
  AppAction,
  Quiz,
  UserProfile,
  QuizAttempt,
  UserAnswer,
  QuizSession,
} from '@/types'
import {
  getUser,
  setUser,
  getAttempts,
  saveAttempt,
  clearAllData,
} from '@/utils/storage'

// ─── Reducer ───────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_QUIZZES':
      return { ...state, quizzes: action.payload }

    case 'SET_PROFILE':
      return { ...state, profile: action.payload }

    case 'SET_ATTEMPTS':
      return { ...state, attempts: action.payload }

    case 'START_SESSION':
      return { ...state, session: action.payload }

    case 'ANSWER_QUESTION': {
      const { session } = state
      if (!session) return state
      return {
        ...state,
        session: {
          ...session,
          answers: { ...session.answers, [action.payload.questionId]: action.payload },
        },
      }
    }

    case 'ADVANCE_QUESTION': {
      const { session } = state
      if (!session) return state
      return {
        ...state,
        session: { ...session, currentQuestionIndex: session.currentQuestionIndex + 1 },
      }
    }

    case 'COMPLETE_SESSION': {
      const { session } = state
      if (!session) return state
      return { ...state, session: { ...session, status: 'completed' } }
    }

    case 'RESET_SESSION':
      return { ...state, session: null }

    case 'SAVE_ATTEMPT':
      return { ...state, attempts: [action.payload, ...state.attempts] }

    case 'CLEAR_DATA':
      return { ...state, profile: null, attempts: [], session: null }

    default:
      return state
  }
}

// ─── Initial state (hydrated from localStorage on first render) ────────────────

function buildInitialState(): AppState {
  return {
    quizzes: [],
    profile: getUser(),
    attempts: getAttempts(),
    session: null,
  }
}

// ─── Context value interface ───────────────────────────────────────────────────

interface AppContextValue {
  // ── State slices ────────────────────────────────────────────────────────────
  profile: UserProfile | null
  attempts: QuizAttempt[]
  session: QuizSession | null
  quizzes: Quiz[]

  /**
   * Raw dispatch — used by the quiz session flow (START_SESSION, ANSWER_QUESTION,
   * ADVANCE_QUESTION, COMPLETE_SESSION, RESET_SESSION, SET_QUIZZES).
   */
  dispatch: Dispatch<AppAction>

  // ── User ────────────────────────────────────────────────────────────────────
  /**
   * Creates a new user profile with the given username and persists it.
   * Any previous attempt history stored on this device is loaded into state.
   */
  login: (username: string) => void
  /**
   * Clears the user profile, all attempt history, and the active session.
   */
  logout: () => void

  // ── Attempts ────────────────────────────────────────────────────────────────
  /**
   * Persists a completed attempt to localStorage and appends it to React state.
   */
  addAttempt: (attempt: QuizAttempt) => void
  /**
   * Returns all attempts for a given quiz id, sorted newest-first.
   */
  getQuizAttempts: (quizId: string) => QuizAttempt[]
  /**
   * Returns the highest score (0–100) ever achieved on a quiz,
   * or null if the quiz has never been attempted.
   */
  getBestScore: (quizId: string) => number | null

  // ── Session helpers ─────────────────────────────────────────────────────────
  /** Opens a fresh session for the given quiz. */
  startSession: (quizId: string, totalQuestions: number) => void
  /** Records the user's answer for the current question. */
  answerQuestion: (answer: UserAnswer) => void
  /** Moves the session to the next question. */
  advanceQuestion: () => void
  /** Marks the session as completed. */
  completeSession: () => void
  /** Destroys the active session without saving. */
  resetSession: () => void
}

// ─── Context object ────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null)

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, buildInitialState)

  /**
   * Keep the stored profile in sync whenever it changes inside React state.
   * This handles future profile-update flows (e.g. username edit) without
   * each action needing to manually call setUser().
   */
  useEffect(() => {
    if (state.profile) {
      setUser(state.profile)
    }
  }, [state.profile])

  // ── User actions ─────────────────────────────────────────────────────────────

  const login = useCallback((username: string) => {
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      username: username.trim(),
      createdAt: new Date().toISOString(),
    }
    // Write to localStorage first so setUser establishes the store record
    // (preserving any attempt history already on this device).
    setUser(profile)
    dispatch({ type: 'SET_PROFILE', payload: profile })
    // Reload attempts from localStorage in case this device has history.
    dispatch({ type: 'SET_ATTEMPTS', payload: getAttempts() })
  }, [])

  const logout = useCallback(() => {
    clearAllData()
    dispatch({ type: 'CLEAR_DATA' })
  }, [])

  // ── Attempt actions ───────────────────────────────────────────────────────────

  const addAttempt = useCallback((attempt: QuizAttempt) => {
    saveAttempt(attempt)
    dispatch({ type: 'SAVE_ATTEMPT', payload: attempt })
  }, [])

  const getQuizAttempts = useCallback(
    (quizId: string): QuizAttempt[] =>
      state.attempts.filter((a) => a.quizId === quizId),
    [state.attempts],
  )

  const getBestScore = useCallback(
    (quizId: string): number | null => {
      const scores = state.attempts
        .filter((a) => a.quizId === quizId)
        .map((a) => a.score)
      return scores.length > 0 ? Math.max(...scores) : null
    },
    [state.attempts],
  )

  // ── Session actions ───────────────────────────────────────────────────────────

  const startSession = useCallback((quizId: string, _totalQuestions: number) => {
    const session: QuizSession = {
      quizId,
      currentQuestionIndex: 0,
      answers: {},
      status: 'in-progress',
      startedAt: new Date().toISOString(),
    }
    dispatch({ type: 'START_SESSION', payload: session })
  }, [])

  const answerQuestion = useCallback((answer: UserAnswer) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: answer })
  }, [])

  const advanceQuestion = useCallback(() => {
    dispatch({ type: 'ADVANCE_QUESTION' })
  }, [])

  const completeSession = useCallback(() => {
    dispatch({ type: 'COMPLETE_SESSION' })
  }, [])

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' })
  }, [])

  // ── Context value ─────────────────────────────────────────────────────────────

  const value: AppContextValue = {
    profile: state.profile,
    attempts: state.attempts,
    session: state.session,
    quizzes: state.quizzes,
    dispatch,
    login,
    logout,
    addAttempt,
    getQuizAttempts,
    getBestScore,
    startSession,
    answerQuestion,
    advanceQuestion,
    completeSession,
    resetSession,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error(
      '[useApp] must be used inside <AppProvider>. ' +
        'Wrap your component tree with <AppProvider> at the root of your app.',
    )
  }
  return ctx
}
