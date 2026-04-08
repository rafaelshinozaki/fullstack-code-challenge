import { Link } from 'react-router-dom'
import { fetchQuizzes } from '../api/quizData'
import { useEffect, useState } from 'react'
import type { Quiz } from '../types'
import { useApp } from '../context/AppContext'

export function QuizzesPage() {
  const { getBestScore } = useApp()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    void fetchQuizzes()
      .then((items) => {
        setQuizzes(items)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Quiz Categories</h1>
        <p className="mt-2 text-slate-600">
          Choose a category to start practicing.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`quiz-skeleton-${index}`}
              className="animate-pulse rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm"
            >
              <div className="h-6 w-2/3 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-200" />
              <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
              <div className="mt-4 h-4 w-28 rounded bg-slate-200" />
              <div className="mt-5 h-9 w-28 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm">
          <p className="text-slate-700">No quizzes available yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Add categories in the data layer to populate this page.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => {
            const bestScore = getBestScore(quiz.id)

            return (
              <Link
                key={quiz.id}
                to={`/quiz/${quiz.id}`}
                className="group block rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-slate-900 transition group-hover:text-primary">
                  {quiz.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    {quiz.questions.length} questions
                  </span>
                  {bestScore !== null && (
                    <span className="rounded-full bg-success/15 px-2.5 py-1 text-success">
                      Best score: {bestScore}%
                    </span>
                  )}
                </div>

                <span className="mt-5 inline-block text-sm font-medium text-primary">
                  Start quiz →
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
