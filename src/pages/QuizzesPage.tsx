import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories } from '../api/quizData'
import { useApp } from '../context/AppContext'
import type { QuizCategory } from '../types'

export function QuizzesPage() {
  const { getBestScore } = useApp()
  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadCategories() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchCategories()
        if (active) setCategories(data)
      } catch {
        if (active) setError('Failed to load quiz categories.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadCategories()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold text-text-base">Quiz Categories</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={index}
              className="animate-pulse rounded-xl border border-border bg-white p-5 shadow-sm"
            >
              <div className="h-5 w-2/3 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-100" />
              <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
              <div className="mt-6 h-4 w-1/3 rounded bg-slate-200" />
            </article>
          ))}
        </div>
      </section>
    )
  }

  if (error) return <p className="text-danger-600">{error}</p>
  if (categories.length === 0) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-bold text-text-base">Quiz Categories</h1>
        <p className="text-text-muted">No quiz categories are available yet. Please check back soon.</p>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold text-text-base">Quiz Categories</h1>
      <p className="text-sm text-text-muted">Choose a category to start practicing.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/quiz/${category.id}`}
            className="group rounded-xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow"
          >
            <article className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-text-base group-hover:text-primary-700">
                  {category.title}
                </h2>
                <p className="mt-1 text-sm text-text-muted">{category.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-text-muted">
                  {category.questionCount} questions
                </span>
                {(() => {
                  const bestScore = getBestScore(category.id)
                  if (bestScore === null) {
                    return <span className="text-text-muted">No attempts yet</span>
                  }
                  return <span className="font-semibold text-success-700">Best: {bestScore}%</span>
                })()}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
