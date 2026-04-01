import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { fetchQuizzes } from '@/api/quizData'
import { getCategoryMeta } from '@/utils/categoryMeta'
import type { Quiz } from '@/types'

// ─── Hero section ──────────────────────────────────────────────────────────────

function HeroSection({ hasProfile }: { hasProfile: boolean }) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center sm:pb-20 sm:pt-28">
      {/* Decorative blurred circles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary-400/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 -z-10 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-warning-400/10 blur-3xl"
      />

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
        <span className="text-xs font-semibold uppercase tracking-widest text-primary-600">
          AI Development Learning Platform
        </span>
      </div>

      {/* Heading */}
      <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight tracking-tight text-text sm:text-5xl lg:text-6xl">
        Master AI Development,{' '}
        <span className="relative whitespace-nowrap text-primary-600">
          One Quiz at a Time
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
        Sharpen your knowledge of agent design, prompt engineering, and model
        selection through focused, bite-sized quizzes — then track your growth
        over time.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#quizzes"
          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          Start a Quiz
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>

        {!hasProfile && (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-7 py-3 text-sm font-semibold text-text shadow-sm transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Create Profile
          </Link>
        )}
      </div>

      {/* Social proof */}
      <p className="mt-8 text-xs text-text-subtle">
        3 quiz categories · 15 questions · Track your progress over time
      </p>
    </section>
  )
}

// ─── Stats section ─────────────────────────────────────────────────────────────

interface StatCardProps {
  value: string
  label: string
  icon: string
}

function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-6 shadow-card">
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <span className="text-3xl font-black text-primary-600">{value}</span>
      <span className="text-sm font-medium text-text-muted">{label}</span>
    </div>
  )
}

interface StatsSectionProps {
  quizzesTaken: number
  categoriesExplored: number
  averageScore: number
}

function StatsSection({ quizzesTaken, categoriesExplored, averageScore }: StatsSectionProps) {
  return (
    <section aria-label="Your progress summary" className="px-4 pb-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-lg font-bold text-text">Your Progress</h2>
          <span className="rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-semibold text-success-700">
            Active
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard value={String(quizzesTaken)} label="Quizzes Taken" icon="📝" />
          <StatCard value={String(categoriesExplored)} label="Categories Explored" icon="🗂️" />
          <StatCard value={`${averageScore}%`} label="Average Score" icon="🎯" />
        </div>
      </div>
    </section>
  )
}

// ─── Quiz card ─────────────────────────────────────────────────────────────────

interface QuizCardProps {
  quiz: Quiz
  bestScore: number | null
  onStart: (id: string) => void
}

function QuizCard({ quiz, bestScore, onStart }: QuizCardProps) {
  const meta = getCategoryMeta(quiz.category)
  const attempted = bestScore !== null

  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      {/* Category badge */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.border} ${meta.color}`}
        >
          <span aria-hidden="true">{meta.emoji}</span>
          {meta.label}
        </span>

        {attempted && (
          <span className="flex items-center gap-1 text-xs font-semibold text-success-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Best: {bestScore}%
          </span>
        )}
      </div>

      {/* Title + description */}
      <h3 className="mb-2 text-lg font-bold text-text transition-colors group-hover:text-primary-600">
        {quiz.title}
      </h3>
      <p className="mb-5 flex-1 text-sm leading-relaxed text-text-muted">
        {quiz.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-subtle">
          {quiz.questions.length} questions
        </span>
        <button
          onClick={() => onStart(quiz.id)}
          className="rounded-full bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          {attempted ? 'Retake' : 'Start Quiz'}
        </button>
      </div>

      {/* Score bar — only when attempted */}
      {attempted && (
        <div className="mt-4 space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${bestScore}%` }}
              role="progressbar"
              aria-valuenow={bestScore ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Best score: ${bestScore}%`}
            />
          </div>
        </div>
      )}
    </article>
  )
}

// ─── Quizzes section ───────────────────────────────────────────────────────────

interface QuizzesSectionProps {
  quizzes: Quiz[]
  loading: boolean
  getBestScore: (id: string) => number | null
  onStart: (id: string) => void
}

function QuizzesSection({ quizzes, loading, getBestScore, onStart }: QuizzesSectionProps) {
  return (
    <section id="quizzes" aria-labelledby="quizzes-heading" className="px-4 pb-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 id="quizzes-heading" className="text-2xl font-bold text-text sm:text-3xl">
            Choose Your Quiz
          </h2>
          <p className="mt-2 text-text-muted">
            Pick a category and put your knowledge to the test.
          </p>
        </div>

        {loading ? (
          /* Skeleton loaders */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-52 animate-pulse rounded-2xl border border-border bg-surface shadow-card"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                bestScore={getBestScore(quiz.id)}
                onStart={onStart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Features section ──────────────────────────────────────────────────────────

interface FeatureCardProps {
  emoji: string
  title: string
  description: string
  accent: string
}

function FeatureCard({ emoji, title, description, accent }: FeatureCardProps) {
  return (
    <div className={`rounded-2xl border ${accent} bg-surface p-6 shadow-card`}>
      <span className="mb-4 inline-block text-3xl" aria-hidden="true">{emoji}</span>
      <h3 className="mb-2 text-base font-bold text-text">{title}</h3>
      <p className="text-sm leading-relaxed text-text-muted">{description}</p>
    </div>
  )
}

const FEATURES: FeatureCardProps[] = [
  {
    emoji: '⚡',
    title: 'Learn by Doing',
    description:
      'Each question comes with an instant explanation so you build intuition, not just memorisation.',
    accent: 'border-primary-200',
  },
  {
    emoji: '📈',
    title: 'Track Progress',
    description:
      'Your scores and attempt history are saved automatically. Watch your average climb over time.',
    accent: 'border-success-200',
  },
  {
    emoji: '🔄',
    title: 'Stay Current',
    description:
      'Quizzes cover practical AI development topics — agents, prompting, and model selection.',
    accent: 'border-warning-200',
  },
]

function FeaturesSection() {
  return (
    <section aria-labelledby="features-heading" className="px-4 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 id="features-heading" className="text-2xl font-bold text-text sm:text-3xl">
            Why AI Dev Quiz?
          </h2>
          <p className="mt-2 text-text-muted">
            Built for developers who learn best by applying knowledge, not reading docs.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Home page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const { profile, attempts, quizzes, dispatch, getBestScore } = useApp()
  const navigate = useNavigate()

  /* Load quizzes once on mount and store in global state */
  useEffect(() => {
    if (quizzes.length > 0) return
    fetchQuizzes().then((data) => {
      dispatch({ type: 'SET_QUIZZES', payload: data })
    })
  }, [quizzes.length, dispatch])

  /* Derived stats — only computed when there are attempts */
  const stats = useMemo(() => {
    if (attempts.length === 0) return null
    const categoriesExplored = new Set(attempts.map((a) => a.category)).size
    const averageScore = Math.round(
      attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length,
    )
    return { quizzesTaken: attempts.length, categoriesExplored, averageScore }
  }, [attempts])

  function handleStartQuiz(quizId: string) {
    navigate(`/quiz/${quizId}`)
  }

  return (
    <main className="flex flex-1 flex-col">
      <HeroSection hasProfile={!!profile} />

      {/* Stats — only when user has attempt history */}
      {stats && (
        <StatsSection
          quizzesTaken={stats.quizzesTaken}
          categoriesExplored={stats.categoriesExplored}
          averageScore={stats.averageScore}
        />
      )}

      <QuizzesSection
        quizzes={quizzes}
        loading={quizzes.length === 0}
        getBestScore={getBestScore}
        onStart={handleStartQuiz}
      />

      <FeaturesSection />
    </main>
  )
}
