import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function HomePage() {
  const { user, attempts } = useApp()

  const hasStats = attempts.length > 0
  const averageScore = hasStats
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length)
    : 0
  const quizzesCompleted = new Set(attempts.map((attempt) => attempt.quizId)).size

  return (
    <section className="space-y-10">
      <div className="rounded-2xl border border-border bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="max-w-3xl space-y-5">
          <p className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
            AI Development Learning Platform
          </p>
          <h1 className="text-3xl font-bold leading-tight text-primary-700 sm:text-4xl lg:text-5xl">
            Build real AI knowledge one quiz at a time
          </h1>
          <p className="text-base text-text-muted sm:text-lg">
            Practice core concepts like agent design, prompt engineering, and model selection with
            instant feedback and detailed explanations.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/quizzes"
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Start Learning
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-semibold text-text-base transition hover:border-primary-300 hover:text-primary-700"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {hasStats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <p className="text-sm text-text-muted">Welcome back</p>
            <p className="mt-1 text-xl font-semibold text-text-base">{user?.username ?? 'Learner'}</p>
          </article>
          <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <p className="text-sm text-text-muted">Average score</p>
            <p className="mt-1 text-xl font-semibold text-success-700">{averageScore}%</p>
          </article>
          <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <p className="text-sm text-text-muted">Quizzes completed</p>
            <p className="mt-1 text-xl font-semibold text-primary-700">{quizzesCompleted}</p>
          </article>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-text-base">Why this app works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-text-base">Instant Feedback</h3>
            <p className="mt-2 text-sm text-text-muted">
              Every answer includes an explanation so users reinforce concepts immediately.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-text-base">Progress Tracking</h3>
            <p className="mt-2 text-sm text-text-muted">
              Attempts are saved locally, making it easy to review history and improve over time.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-text-base">Expandable Content</h3>
            <p className="mt-2 text-sm text-text-muted">
              New quiz categories can be added with minimal changes as your curriculum grows.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
