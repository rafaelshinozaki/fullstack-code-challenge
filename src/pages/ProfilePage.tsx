import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function ProfilePage() {
  const { user, attempts, login, logout, resetData } = useApp()
  const [username, setUsername] = useState('')

  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
            attempts.length,
        )
      : 0
  const bestScore =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => attempt.percentage))
      : 0
  const completedQuizzes = new Set(attempts.map((attempt) => attempt.quizId)).size

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    login(username)
    setUsername('')
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
      <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>

      {user ? (
        <div className="mt-4 space-y-5">
          <p className="text-slate-600">
            Signed in as <span className="font-medium text-slate-900">{user.username}</span>
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Total Attempts</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {attempts.length}
              </p>
            </article>
            <article className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Average Score</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {averageScore}%
              </p>
            </article>
            <article className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Best Score</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{bestScore}%</p>
            </article>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Quizzes Completed</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {completedQuizzes}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetData}
              className="rounded-md border border-warning/35 bg-warning/10 px-4 py-2 text-sm font-medium text-warning transition hover:bg-warning/15"
            >
              Reset quiz data
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-danger/35 bg-danger/10 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/15"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 max-w-md space-y-4">
          <p className="text-sm text-slate-600">
            Create a profile to personalize your progress tracking.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm font-medium text-slate-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-primary/35 transition focus:ring-2"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
            >
              Create profile
            </button>
          </form>
          <Link
            to="/quizzes"
            className="inline-block text-sm font-medium text-primary hover:underline"
          >
            Continue as guest
          </Link>
        </div>
      )}
    </section>
  )
}
