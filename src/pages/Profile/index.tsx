import { useState, useId } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'

// ─── Validation ────────────────────────────────────────────────────────────────

const MIN_LEN = 2
const MAX_LEN = 20

function validate(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length === 0) return 'Username is required.'
  if (trimmed.length < MIN_LEN) return `Must be at least ${MIN_LEN} characters.`
  if (trimmed.length > MAX_LEN) return `Must be no more than ${MAX_LEN} characters.`
  if (!/^[a-zA-Z0-9_ -]+$/.test(trimmed))
    return 'Only letters, numbers, spaces, hyphens, and underscores are allowed.'
  return ''
}

// ─── Create profile form ───────────────────────────────────────────────────────

function CreateProfileForm() {
  const { login } = useApp()
  const navigate = useNavigate()
  const inputId = useId()
  const errorId = useId()

  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const error = validate(value)
  const showError = touched && error !== ''
  const charCount = value.trim().length

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (error) return

    setSubmitting(true)
    login(value.trim())
    navigate('/quizzes')
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-card">
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="mb-4 inline-block text-5xl" aria-hidden="true">👤</span>
            <h1 className="text-2xl font-black text-text">Create Your Profile</h1>
            <p className="mt-2 text-sm text-text-muted">
              Pick a username to start tracking your quiz progress.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Username field */}
            <div className="mb-6">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor={inputId}
                  className="text-sm font-semibold text-text"
                >
                  Username
                </label>
                <span
                  className={`text-xs font-medium ${
                    charCount > MAX_LEN ? 'text-danger-600' : 'text-text-subtle'
                  }`}
                  aria-live="polite"
                >
                  {charCount}/{MAX_LEN}
                </span>
              </div>

              <input
                id={inputId}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="e.g. sarah_dev"
                maxLength={MAX_LEN + 5}
                autoComplete="username"
                autoFocus
                aria-describedby={showError ? errorId : undefined}
                aria-invalid={showError}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-subtle focus:ring-2 focus:ring-offset-1 ${
                  showError
                    ? 'border-danger-400 bg-danger-50/50 focus:border-danger-500 focus:ring-danger-300'
                    : 'border-border bg-surface-alt focus:border-primary-500 focus:ring-primary-300'
                }`}
              />

              {/* Validation message */}
              {showError && (
                <p
                  id={errorId}
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}

              {/* Helper text */}
              {!showError && (
                <p className="mt-1.5 text-xs text-text-subtle">
                  {MIN_LEN}–{MAX_LEN} characters. Letters, numbers, spaces, hyphens, underscores.
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-primary-500/25 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              {submitting ? 'Creating…' : 'Create Profile & Start Quizzing →'}
            </button>
          </form>
        </div>

        {/* Already have a profile? */}
        <p className="mt-5 text-center text-xs text-text-subtle">
          Already have a profile on this device?{' '}
          <Link to="/dashboard" className="font-semibold text-primary-600 hover:underline">
            Go to Dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── Logged-in profile view ────────────────────────────────────────────────────

function ProfileView() {
  const { profile, attempts, logout } = useApp()
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)

  if (!profile) return null

  const initial = profile.username.charAt(0).toUpperCase()
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
      : null
  const uniqueQuizzes = new Set(attempts.map((a) => a.quizId)).size

  function handleReset() {
    logout()
    navigate('/')
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          {/* Coloured banner */}
          <div className="h-24 bg-gradient-to-br from-primary-600 to-primary-400" />

          {/* Avatar + name */}
          <div className="px-8 pb-8">
            {/* Avatar overlapping the banner */}
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface bg-primary-600 text-3xl font-black text-white shadow-md">
                {initial}
              </div>
              <Link
                to="/dashboard"
                className="mb-1 flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:border-primary-300 hover:text-primary-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Dashboard
              </Link>
            </div>

            <h1 className="text-2xl font-black text-text">{profile.username}</h1>
            <p className="mt-0.5 text-sm text-text-muted">
              Member since{' '}
              {new Date(profile.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-surface-alt p-4 text-center">
                <p className="text-2xl font-black text-primary-600">{uniqueQuizzes}</p>
                <p className="text-xs font-medium text-text-muted">Quizzes Taken</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-alt p-4 text-center">
                <p className="text-2xl font-black text-primary-600">
                  {avgScore !== null ? `${avgScore}%` : '—'}
                </p>
                <p className="text-xs font-medium text-text-muted">Average Score</p>
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-border" />

            {/* Danger zone */}
            <div className="rounded-xl border border-danger-200 bg-danger-50/50 p-4">
              <h2 className="mb-1 text-sm font-bold text-danger-700">Danger Zone</h2>
              <p className="mb-4 text-xs leading-relaxed text-danger-600">
                Resetting your profile permanently deletes your username and all
                quiz attempt history. This action cannot be undone.
              </p>

              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="rounded-lg border border-danger-300 bg-surface px-4 py-2 text-xs font-semibold text-danger-700 transition hover:bg-danger-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-500"
                >
                  Reset Profile…
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Confirmation warning */}
                  <div className="flex items-start gap-2 rounded-lg border border-danger-300 bg-danger-100 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-danger-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs font-semibold text-danger-800">
                      Are you sure? All your quiz history will be lost forever.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 rounded-lg bg-danger-600 py-2 text-xs font-bold text-white transition hover:bg-danger-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-600"
                    >
                      Yes, Reset Everything
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="flex-1 rounded-lg border border-border bg-surface py-2 text-xs font-semibold text-text transition hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { profile } = useApp()
  return profile ? <ProfileView /> : <CreateProfileForm />
}
