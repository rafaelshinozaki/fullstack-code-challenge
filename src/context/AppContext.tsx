import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { QuizAttempt, UserProfile } from '../types'
import {
  clearAllData,
  createUser,
  getAttemptsByQuizId,
  getUser,
  saveAttempt,
  setUser,
} from '../utils/storage'

// ─── Shape ────────────────────────────────────────────────────────────────────

interface AppContextValue {
  /** Currently logged-in user, or null before login. */
  user: UserProfile | null
  /** Flat list of all attempts from the current user profile. */
  attempts: QuizAttempt[]
  /** Whether a user profile exists in localStorage. */
  isLoggedIn: boolean

  /**
   * Creates or restores a user profile by username.
   * If a profile already exists with a different name, it is overwritten.
   */
  login: (username: string) => void

  /**
   * Clears all app data from localStorage and resets state.
   */
  logout: () => void

  /**
   * Appends a finished attempt to the user's history and syncs to localStorage.
   * No-op if no user is logged in.
   */
  addAttempt: (attempt: QuizAttempt) => void

  /**
   * Returns all attempts for a given quiz id, sorted newest-first.
   */
  getQuizAttempts: (quizId: string) => QuizAttempt[]

  /**
   * Returns the highest percentage score achieved for a quiz, or null
   * if the user has never attempted it.
   */
  getBestScore: (quizId: string) => number | null
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(() => getUser())

  // Keep the flat attempts list derived from the user profile.
  // Using a separate state slice avoids re-reading localStorage on every render.
  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => getUser()?.attempts ?? [])

  // Sync any external localStorage changes (e.g. another tab) into state.
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'quiz_app_user') {
        const updated = getUser()
        setUserState(updated)
        setAttempts(updated?.attempts ?? [])
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // ─── Actions ────────────────────────────────────────────────────────────────

  const login = useCallback((username: string) => {
    const existing = getUser()
    let profile: UserProfile

    if (existing) {
      // Update username in place, keep existing attempts.
      profile = { ...existing, username: username.trim() || 'Guest' }
      setUser(profile)
    } else {
      profile = createUser(username)
    }

    setUserState(profile)
    setAttempts(profile.attempts)
  }, [])

  const logout = useCallback(() => {
    clearAllData()
    setUserState(null)
    setAttempts([])
  }, [])

  const addAttempt = useCallback((attempt: QuizAttempt) => {
    setUserState((prev) => {
      if (!prev) return prev

      const updated: UserProfile = {
        ...prev,
        attempts: [...prev.attempts, attempt],
      }

      // Persist to localStorage via storage utility.
      saveAttempt(attempt)

      // Update flat attempts slice.
      setAttempts(updated.attempts)

      return updated
    })
  }, [])

  const getQuizAttempts = useCallback(
    (quizId: string): QuizAttempt[] => {
      // Read directly from localStorage to ensure fresh data.
      return getAttemptsByQuizId(quizId)
    },
    // Invalidate when attempts change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempts],
  )

  const getBestScore = useCallback(
    (quizId: string): number | null => {
      const quizAttempts = getAttemptsByQuizId(quizId)
      if (quizAttempts.length === 0) return null
      return Math.max(...quizAttempts.map((a) => a.percentage))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempts],
  )

  // ─── Memoised value ─────────────────────────────────────────────────────────

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      attempts,
      isLoggedIn: user !== null,
      login,
      logout,
      addAttempt,
      getQuizAttempts,
      getBestScore,
    }),
    [user, attempts, login, logout, addAttempt, getQuizAttempts, getBestScore],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access global user state and quiz history from any component.
 * Must be used inside <AppProvider>.
 */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useApp must be used within an <AppProvider>.')
  }
  return ctx
}
