import { useApp } from '../context/AppContext'
import { useMemo, useState } from 'react'

export function ProfilePage() {
  const { user, attempts, isLoggedIn, login, logout } = useApp()
  const [usernameInput, setUsernameInput] = useState('')

  const stats = useMemo(() => {
    const totalAttempts = attempts.length
    const averageScore =
      totalAttempts === 0
        ? 0
        : Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts)
    const bestScore =
      totalAttempts === 0 ? 0 : Math.max(...attempts.map((attempt) => attempt.percentage))
    const completedQuizzes = new Set(attempts.map((attempt) => attempt.quizId)).size
    return { totalAttempts, averageScore, bestScore, completedQuizzes }
  }, [attempts])

  function handleCreateProfile(): void {
    login(usernameInput.trim() || 'Guest')
    setUsernameInput('')
  }

  function handleResetData(): void {
    const confirmed = window.confirm(
      'Reset all local data? This will remove your profile and all quiz attempts.',
    )
    if (!confirmed) return
    logout()
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-text-base">Profile</h1>

      {isLoggedIn && user ? (
        <>
          <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <p className="text-sm text-text-muted">Username</p>
            <p className="mt-1 text-lg font-semibold text-text-base">{user.username}</p>
            <p className="mt-2 text-xs text-text-muted">
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <p className="text-sm text-text-muted">Total attempts</p>
              <p className="mt-1 text-3xl font-bold text-primary-700">{stats.totalAttempts}</p>
            </article>
            <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <p className="text-sm text-text-muted">Average score</p>
              <p className="mt-1 text-3xl font-bold text-primary-700">{stats.averageScore}%</p>
            </article>
            <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <p className="text-sm text-text-muted">Best score</p>
              <p className="mt-1 text-3xl font-bold text-success-700">{stats.bestScore}%</p>
            </article>
            <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <p className="text-sm text-text-muted">Quizzes completed</p>
              <p className="mt-1 text-3xl font-bold text-text-base">{stats.completedQuizzes}</p>
            </article>
          </div>

          <article className="rounded-xl border border-danger-200 bg-danger-50 p-5">
            <h2 className="text-lg font-semibold text-danger-700">Reset data</h2>
            <p className="mt-1 text-sm text-danger-700/90">
              This clears your local profile and all quiz attempt history.
            </p>
            <button
              type="button"
              onClick={handleResetData}
              className="mt-3 rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"
            >
              Reset all data
            </button>
          </article>
        </>
      ) : (
        <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-text-muted">No profile yet. Create one to track your progress.</p>
          <div className="mt-4 flex flex-col gap-3 sm:max-w-md">
            <label className="text-sm font-medium text-text-base" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              value={usernameInput}
              onChange={(event) => setUsernameInput(event.target.value)}
              placeholder="Enter your name"
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <button
              type="button"
              onClick={handleCreateProfile}
              className="w-fit rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Create profile
            </button>
          </div>
        </article>
      )}
    </section>
  )
}
