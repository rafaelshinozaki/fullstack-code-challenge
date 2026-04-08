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
  clearAttempts,
  clearAllData,
  getAttempts,
  getUser,
  saveAttempt,
  setUser,
} from '../utils/storage'

interface AppContextValue {
  user: UserProfile | null
  attempts: QuizAttempt[]
  login: (username: string) => UserProfile
  logout: () => void
  resetData: () => void
  addAttempt: (attempt: QuizAttempt) => QuizAttempt[]
  getQuizAttempts: (quizId: string) => QuizAttempt[]
  getBestScore: (quizId: string) => number | null
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

function createUserProfile(username: string): UserProfile {
  const now = new Date().toISOString()

  return {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `user-${Date.now()}`,
    username,
    createdAt: now,
    updatedAt: now,
  }
}

export function AppProvider({ children }: AppProviderProps) {
  const [user, setCurrentUser] = useState<UserProfile | null>(() => getUser())
  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => getAttempts())

  useEffect(() => {
    const onStorageChange = () => {
      setCurrentUser(getUser())
      setAttempts(getAttempts())
    }

    window.addEventListener('storage', onStorageChange)
    return () => {
      window.removeEventListener('storage', onStorageChange)
    }
  }, [])

  const login = useCallback((username: string): UserProfile => {
    const normalizedUsername = username.trim()
    const nextUser = createUserProfile(
      normalizedUsername.length > 0 ? normalizedUsername : 'Guest',
    )

    setCurrentUser(nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  const logout = useCallback(() => {
    clearAllData()
    setCurrentUser(null)
    setAttempts([])
  }, [])

  const resetData = useCallback(() => {
    clearAttempts()
    setAttempts([])
  }, [])

  const addAttempt = useCallback((attempt: QuizAttempt): QuizAttempt[] => {
    const nextAttempts = saveAttempt(attempt)
    setAttempts(nextAttempts)
    return nextAttempts
  }, [])

  const getQuizAttempts = useCallback(
    (quizId: string): QuizAttempt[] =>
      attempts.filter((attempt) => attempt.quizId === quizId),
    [attempts],
  )

  const getBestScore = useCallback(
    (quizId: string): number | null => {
      const quizAttempts = attempts.filter((attempt) => attempt.quizId === quizId)
      if (quizAttempts.length === 0) {
        return null
      }

      return Math.max(...quizAttempts.map((attempt) => attempt.percentage))
    },
    [attempts],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      attempts,
      login,
      logout,
      resetData,
      addAttempt,
      getQuizAttempts,
      getBestScore,
    }),
    [
      attempts,
      user,
      login,
      logout,
      resetData,
      addAttempt,
      getQuizAttempts,
      getBestScore,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
