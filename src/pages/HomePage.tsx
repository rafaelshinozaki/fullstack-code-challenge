import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function HomePage() {
  const { user, attempts } = useApp()

  const hasData = attempts.length > 0
  const quizzesCompleted = new Set(attempts.map((attempt) => attempt.quizId)).size
  const bestScore =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => attempt.percentage))
      : null

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-sm sm:p-8 lg:p-10">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          AI Development Learning
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          Master agent design, prompt engineering, and model choices with hands-on
          quizzes
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Build practical AI knowledge with immediate feedback and clear
          explanations after every answer. Track your progress as you improve.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/quizzes"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-95"
          >
            Start learning
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
          >
            Open dashboard
          </Link>
        </div>

        {!user && (
          <p className="mt-4 text-sm text-slate-500">
            Tip: create a profile to save history across sessions.
          </p>
        )}
      </section>

      {hasData && (
        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Attempts</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {attempts.length}
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Quizzes Completed</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {quizzesCompleted}
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Best Score</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {bestScore ?? 0}%
            </p>
          </article>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Why use this app</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Instant feedback
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              See correct or incorrect status right away with concise explanations.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Progress tracking
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Monitor attempts, completed quizzes, and score improvements over time.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Ready to scale
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Content-driven structure makes it easy to add new categories and topics.
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
