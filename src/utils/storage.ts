import type { QuizAttempt, UserProfile } from '../types'

const STORAGE_KEYS = {
  user: 'quizapp:user',
  attempts: 'quizapp:attempts',
} as const

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    typeof value.username === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

function isQuizAttempt(value: unknown): value is QuizAttempt {
  if (!isRecord(value)) return false
  if (
    typeof value.id !== 'string' ||
    typeof value.quizId !== 'string' ||
    typeof value.quizTitle !== 'string' ||
    typeof value.userId !== 'string' ||
    typeof value.score !== 'number' ||
    typeof value.totalQuestions !== 'number' ||
    typeof value.percentage !== 'number' ||
    typeof value.createdAt !== 'string'
  ) {
    return false
  }

  if (!Array.isArray(value.answers)) return false

  return value.answers.every((answer) => {
    if (!isRecord(answer)) return false
    return (
      typeof answer.questionId === 'number' &&
      typeof answer.selectedAnswer === 'number' &&
      typeof answer.isCorrect === 'boolean'
    )
  })
}

function safeParse<T>(raw: string | null, guard: (value: unknown) => value is T): T | null {
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    return guard(parsed) ? parsed : null
  } catch {
    return null
  }
}

function safeParseAttempts(raw: string | null): QuizAttempt[] {
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isQuizAttempt)
  } catch {
    return []
  }
}

export function getUser(): UserProfile | null {
  const storage = getStorage()
  if (!storage) return null

  const raw = storage.getItem(STORAGE_KEYS.user)
  return safeParse(raw, isUserProfile)
}

export function setUser(user: UserProfile): void {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

export function getAttempts(): QuizAttempt[] {
  const storage = getStorage()
  if (!storage) return []

  const raw = storage.getItem(STORAGE_KEYS.attempts)
  return safeParseAttempts(raw)
}

export function saveAttempt(attempt: QuizAttempt): QuizAttempt[] {
  const storage = getStorage()
  if (!storage) return [attempt]

  const currentAttempts = getAttempts()
  const nextAttempts = [...currentAttempts, attempt]
  storage.setItem(STORAGE_KEYS.attempts, JSON.stringify(nextAttempts))
  return nextAttempts
}

export function setAttempts(attempts: QuizAttempt[]): void {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(STORAGE_KEYS.attempts, JSON.stringify(attempts))
}

export function clearAttempts(): void {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(STORAGE_KEYS.attempts)
}

export function clearAllData(): void {
  const storage = getStorage()
  if (!storage) return

  storage.removeItem(STORAGE_KEYS.user)
  storage.removeItem(STORAGE_KEYS.attempts)
}
