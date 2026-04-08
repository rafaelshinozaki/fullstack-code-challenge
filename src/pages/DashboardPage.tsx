import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { fetchQuizzes } from '../api/quizData'
import { useApp } from '../context/AppContext'
import type { Quiz } from '../types'

export function DashboardPage() {
  const { user, attempts } = useApp()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState<boolean>(true)

  useEffect(() => {
    void fetchQuizzes()
      .then((items) => {
        setQuizzes(items)
      })
      .finally(() => {
        setIsLoadingQuizzes(false)
      })
  }, [])

  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
            attempts.length,
        )
      : 0

  const bestScores = useMemo(() => {
    const grouped = new Map<string, { title: string; score: number }>()
    attempts.forEach((attempt) => {
      const current = grouped.get(attempt.quizId)
      if (!current || attempt.percentage > current.score) {
        grouped.set(attempt.quizId, {
          title: attempt.quizTitle,
          score: attempt.percentage,
        })
      }
    })
    return Array.from(grouped.entries()).map(([quizId, value]) => ({
      quizId,
      ...value,
    }))
  }, [attempts])

  const progressByQuiz = useMemo(
    () =>
      quizzes.map((quiz) => {
        const quizAttempts = attempts.filter((attempt) => attempt.quizId === quiz.id)
        const best = quizAttempts.length
          ? Math.max(...quizAttempts.map((attempt) => attempt.percentage))
          : 0
        return {
          id: quiz.id,
          title: quiz.title,
          attempts: quizAttempts.length,
          best,
        }
      }),
    [quizzes, attempts],
  )

  const completedQuizzes = progressByQuiz.filter((item) => item.attempts > 0).length
  const overallProgress = quizzes.length
    ? Math.round((completedQuizzes / quizzes.length) * 100)
    : 0

  const recentActivity = useMemo(
    () =>
      [...attempts]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [attempts],
  )

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-3 text-slate-600">
          {user
            ? `Welcome back, ${user.username}.`
            : 'Create a profile to track your progress.'}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <p className="text-sm text-slate-500">Total Attempts</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {attempts.length}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <p className="text-sm text-slate-500">Average Score</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {averageScore}%
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <p className="text-sm text-slate-500">Quiz Progress</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {completedQuizzes}/{quizzes.length || 0}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">{overallProgress}% completed</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-900">Best Scores</h2>
          {bestScores.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No attempts yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {bestScores.map((item) => (
                <li
                  key={item.quizId}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{item.title}</span>
                  <span className="text-sm font-semibold text-success">
                    {item.score}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              Start a quiz to see recent activity here.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800">{item.quizTitle}</p>
                    <span className="text-sm font-semibold text-primary">
                      {item.percentage}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quiz Progress</h2>
        {isLoadingQuizzes ? (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`progress-skeleton-${index}`}
                className="animate-pulse rounded-md border border-slate-200 bg-white px-3 py-2"
              >
                <div className="h-4 w-1/2 rounded bg-slate-200" />
                <div className="mt-2 h-2 w-full rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : progressByQuiz.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            No quiz categories found.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {progressByQuiz.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-slate-200 bg-white px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <span className="text-xs text-slate-500">
                    {item.attempts} attempt{item.attempts === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${item.best}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Best score: {item.best}%</p>
              </div>
            ))}
          </div>
        )}
      </article>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/quizzes"
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
        >
          Start a quiz
        </Link>
        <Link
          to="/profile"
          className="inline-block rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
        >
          Manage profile
        </Link>
      </div>
    </section>
  )
}
