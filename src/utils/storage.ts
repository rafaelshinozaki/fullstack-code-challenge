import type { UserProfile, QuizAttempt, QuizSession } from '../types'

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  USER: 'quiz_app_user',
  SESSION: 'quiz_app_session',
} as const

type StorageKey = (typeof KEYS)[keyof typeof KEYS]

// ─── Generic Helpers ──────────────────────────────────────────────────────────

function read<T>(key: StorageKey): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    console.warn(`[storage] Failed to parse key "${key}" — clearing it.`)
    localStorage.removeItem(key)
    return null
  }
}

function write<T>(key: StorageKey, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`[storage] Failed to write key "${key}":`, err)
  }
}

// ─── User Profile ─────────────────────────────────────────────────────────────

/**
 * Returns the persisted user profile, or null if none exists yet.
 */
export function getUser(): UserProfile | null {
  return read<UserProfile>(KEYS.USER)
}

/**
 * Persists the full user profile (overwrites any existing value).
 */
export function setUser(profile: UserProfile): void {
  write<UserProfile>(KEYS.USER, profile)
}

/**
 * Creates a fresh profile with the given username and saves it.
 * Returns the created profile.
 */
export function createUser(username: string): UserProfile {
  const profile: UserProfile = {
    username: username.trim() || 'Guest',
    createdAt: new Date().toISOString(),
    attempts: [],
  }
  setUser(profile)
  return profile
}

/**
 * Appends a completed attempt to the user's history and persists.
 * No-op if no profile exists.
 */
export function saveAttempt(attempt: QuizAttempt): void {
  const profile = getUser()
  if (!profile) {
    console.warn('[storage] saveAttempt called with no user profile.')
    return
  }
  const updated: UserProfile = {
    ...profile,
    attempts: [...profile.attempts, attempt],
  }
  setUser(updated)
}

// ─── Attempts ─────────────────────────────────────────────────────────────────

/**
 * Returns all recorded attempts, sorted newest-first.
 * Returns an empty array if no profile exists.
 */
export function getAttempts(): QuizAttempt[] {
  const profile = getUser()
  if (!profile) return []
  return [...profile.attempts].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )
}

/**
 * Returns all attempts for a specific quiz, sorted newest-first.
 */
export function getAttemptsByQuizId(quizId: string): QuizAttempt[] {
  return getAttempts().filter((a) => a.quizId === quizId)
}

/**
 * Returns a single attempt by its unique id, or null if not found.
 */
export function getAttemptById(attemptId: string): QuizAttempt | null {
  return getAttempts().find((a) => a.id === attemptId) ?? null
}

// ─── Session (in-progress quiz) ───────────────────────────────────────────────

/**
 * Returns the in-progress quiz session if one exists, otherwise null.
 */
export function getSession(): QuizSession | null {
  return read<QuizSession>(KEYS.SESSION)
}

/**
 * Persists the current quiz session (upsert).
 */
export function setSession(session: QuizSession): void {
  write<QuizSession>(KEYS.SESSION, session)
}

/**
 * Removes the in-progress session (call after quiz completion or abandon).
 */
export function clearSession(): void {
  localStorage.removeItem(KEYS.SESSION)
}

// ─── Nuclear Option ───────────────────────────────────────────────────────────

/**
 * Wipes ALL quiz app data from localStorage. Useful for "reset" flows.
 */
export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
}
