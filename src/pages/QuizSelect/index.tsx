import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { fetchQuizzes } from '@/api/quizData'
import { getCategoryMeta } from '@/utils/categoryMeta'
import type { Quiz } from '@/types'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function scoreBadgeClasses(score: number): string {
  if (score >= 80) return 'bg-success-50 text-success-700 border-success-200'
  if (score >= 50) return 'bg-warning-50 text-warning-700 border-warning-200'
  return 'bg-danger-50 text-danger-700 border-danger-200'
}

function scoreIcon(score: number): string {
  if (score >= 80) return '🏆'
  if (score >= 50) return '📈'
  return '💪'
}

// ─── Loading spinner ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24" aria-live="polite" aria-label="Loading quizzes">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <p className="text-sm font-medium text-text-muted">Loading quizzes…</p>
    </div>
  )
}

// ─── Quiz card ─────────────────────────────────────────────────────────────────

interface QuizCardProps {
  quiz: Quiz
  bestScore: number | null
  attemptCount: number
  onSelect: (id: string) => void
}

function QuizCard({ quiz, bestScore, attemptCount, onSelect }: QuizCardProps) {
  const meta = getCategoryMeta(quiz.category)
  const attempted = bestScore !== null

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(quiz.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(quiz.id)}
      aria-label={`Start ${quiz.title}`}
      className={[
        'group relative flex cursor-pointer flex-col rounded-2xl border bg-surface p-6',
        'shadow-card outline-none',
        'transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-card-hover',
        `focus-visible:ring-2 focus-visible:ring-offset-2 ${meta.ring}`,
        `border-border ${meta.hoverBorder}`,
      ].join(' ')}
    >
      {/* Top row: category pill + score badge */}
      <div className="mb-5 flex items-start justify-between gap-3">
        {/* Category pill */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.border} ${meta.color}`}
        >
          <span aria-hidden="true">{meta.emoji}</span>
          {meta.label}
        </span>

        {/* Score badge / Not attempted */}
        {attempted ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${scoreBadgeClasses(bestScore)}`}
          >
            <span aria-hidden="true">{scoreIcon(bestScore)}</span>
            {bestScore}%
          </span>
        ) : (
          <span className="rounded-full border border-border bg-surface-alt px-3 py-1 text-xs font-medium text-text-subtle">
            Not attempted
          </span>
        )}
      </div>

      {/* Emoji icon */}
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl ${meta.bg} ${meta.border} transition-transform duration-200 group-hover:scale-110`}
        aria-hidden="true"
      >
        {meta.emoji}
      </div>

      {/* Title */}
      <h2 className={`mb-2 text-lg font-bold text-text transition-colors group-hover:${meta.color}`}>
        {quiz.title}
      </h2>

      {/* Description */}
      <p className="mb-6 flex-1 text-sm leading-relaxed text-text-muted">
        {quiz.description}
      </p>

      {/* Footer: question count + attempt count + CTA */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-3 text-xs text-text-subtle">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {quiz.questions.length} questions
          </span>
          {attempted && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {attemptCount} {attemptCount === 1 ? 'attempt' : 'attempts'}
            </span>
          )}
        </div>

        <span
          className={`rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${
            attempted
              ? 'bg-text-muted group-hover:bg-text'
              : 'bg-primary-600 group-hover:bg-primary-700'
          }`}
          aria-hidden="true"
        >
          {attempted ? 'Retake' : 'Start'}
        </span>
      </div>

      {/* Best-score progress bar — only when attempted */}
      {attempted && (
        <div className="mt-4">
          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                bestScore >= 80
                  ? 'bg-success-500'
                  : bestScore >= 50
                    ? 'bg-warning-500'
                    : 'bg-danger-500'
              }`}
              style={{ width: `${bestScore}%` }}
              role="progressbar"
              aria-valuenow={bestScore}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Best score ${bestScore}%`}
            />
          </div>
        </div>
      )}
    </article>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function QuizSelect() {
  const { quizzes, attempts, dispatch, getBestScore, getQuizAttempts } = useApp()
  const navigate = useNavigate()

  /* Fetch quizzes if not already loaded (e.g. direct navigation to /quizzes) */
  useEffect(() => {
    if (quizzes.length > 0) return
    fetchQuizzes().then((data) => {
      dispatch({ type: 'SET_QUIZZES', payload: data })
    })
  }, [quizzes.length, dispatch])

  const totalAttempted = new Set(attempts.map((a) => a.quizId)).size

  return (
    <main className="flex flex-1 flex-col px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">

        {/* Page header */}
        <header className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600">
              {quizzes.length} Categories Available
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
            All Quizzes
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-text-muted">
            Choose a category to test your knowledge. Each quiz gives you instant
            feedback and tracks your personal best.
          </p>

          {/* Summary bar — only when some quizzes attempted */}
          {totalAttempted > 0 && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 px-4 py-2 text-sm font-medium text-success-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              You've attempted {totalAttempted} of {quizzes.length} {quizzes.length === 1 ? 'category' : 'categories'}
            </div>
          )}
        </header>

        {/* Grid / Spinner */}
        {quizzes.length === 0 ? (
          <Spinner />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                bestScore={getBestScore(quiz.id)}
                attemptCount={getQuizAttempts(quiz.id).length}
                onSelect={(id) => navigate(`/quiz/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
