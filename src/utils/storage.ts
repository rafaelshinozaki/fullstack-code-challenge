import type { UserProfile, QuizAttempt, StoredUser } from '@/types'

// ─── Storage keys ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'qza:user' as const

// ─── Low-level helpers ─────────────────────────────────────────────────────────

function readStore(): StoredUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

function writeStore(data: StoredUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ─── User profile ──────────────────────────────────────────────────────────────

/**
 * Returns the stored user profile, or null if none exists.
 */
export function getUser(): UserProfile | null {
  return readStore()?.profile ?? null
}

/**
 * Persists a user profile. Creates the store record if it does not exist.
 */
export function setUser(profile: UserProfile): void {
  const existing = readStore()
  writeStore({
    profile,
    attempts: existing?.attempts ?? [],
  })
}

// ─── Attempt history ───────────────────────────────────────────────────────────

/**
 * Returns all quiz attempts for the current user, sorted newest-first.
 */
export function getAttempts(): QuizAttempt[] {
  const attempts = readStore()?.attempts ?? []
  return [...attempts].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )
}

/**
 * Returns all attempts for a specific quiz, sorted newest-first.
 */
export function getAttemptsByQuiz(quizId: string): QuizAttempt[] {
  return getAttempts().filter((a) => a.quizId === quizId)
}

/**
 * Appends a new attempt to the user's history.
 * Requires a profile to already exist (no-op with console warning if not).
 */
export function saveAttempt(attempt: QuizAttempt): void {
  const store = readStore()
  if (!store) {
    console.warn('[storage] saveAttempt called before a user profile exists.')
    return
  }
  writeStore({
    profile: store.profile,
    attempts: [attempt, ...store.attempts],
  })
}

// ─── Reset ─────────────────────────────────────────────────────────────────────

/**
 * Wipes the entire user store from localStorage.
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY)
}
