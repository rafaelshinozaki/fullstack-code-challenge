import { Link } from 'react-router-dom'
import { categories } from '../api/quizData'
import { useApp } from '../context/AppContext'

export function DashboardPage() {
  const { attempts } = useApp()
  const totalAttempts = attempts.length
  const averageScore =
    totalAttempts === 0
      ? 0
      : Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts)
  const bestScore =
    totalAttempts === 0 ? 0 : Math.max(...attempts.map((attempt) => attempt.percentage))
  const completedQuizIds = new Set(attempts.map((attempt) => attempt.quizId))
  const completedQuizzes = completedQuizIds.size
  const totalQuizzes = categories.length
  const progressPercent = totalQuizzes === 0 ? 0 : Math.round((completedQuizzes / totalQuizzes) * 100)
  const recentActivity = [...attempts]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5)

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-text-base">Dashboard</h1>
      <p className="text-text-muted">Track your performance over time.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-text-muted">Total attempts</p>
          <p className="mt-1 text-3xl font-bold text-primary-700">{totalAttempts}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-text-muted">Average score</p>
          <p className="mt-1 text-3xl font-bold text-primary-700">{averageScore}%</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-text-muted">Best score</p>
          <p className="mt-1 text-3xl font-bold text-success-700">{bestScore}%</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-text-muted">Quiz progress</p>
          <p className="mt-1 text-3xl font-bold text-text-base">
            {completedQuizzes}/{totalQuizzes}
          </p>
        </div>
      </div>

      <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm text-text-muted">
          <span>Overall quiz progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-primary-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </article>

      <article className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-base">Recent activity</h2>
          <Link to="/quizzes" className="mt-1 inline-flex text-sm font-medium text-primary-700 hover:underline">
            Start a new quiz
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <p className="text-sm text-text-muted">No attempts yet. Start your first quiz to see activity here.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((attempt) => (
              <Link
                key={attempt.id}
                to={`/results/${attempt.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition hover:border-primary-300 hover:bg-primary-50"
              >
                <div>
                  <p className="font-medium text-text-base">{attempt.quizTitle}</p>
                  <p className="text-xs text-text-muted">{new Date(attempt.completedAt).toLocaleString()}</p>
                </div>
                <p className="font-semibold text-primary-700">
                  {attempt.score}/{attempt.total} ({attempt.percentage}%)
                </p>
              </Link>
            ))}
          </div>
        )}
      </article>
    </section>
  )
}
