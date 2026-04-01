import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { fetchQuizzes } from '@/api/quizData'
import { getCategoryMeta } from '@/utils/categoryMeta'
import { getFeedbackClasses } from '@/utils/scoring'
import type { Quiz, QuizAttempt } from '@/types'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-success-500'
  if (score >= 60) return 'bg-primary-500'
  if (score >= 40) return 'bg-warning-500'
  return 'bg-danger-500'
}

function avgScore(attempts: QuizAttempt[]): number {
  if (attempts.length === 0) return 0
  return Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
}

// ─── Not-logged-in state ───────────────────────────────────────────────────────

function GuestDashboard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="mb-5 text-7xl" aria-hidden="true">📊</span>
      <h1 className="mb-3 text-3xl font-black text-text">Your Dashboard</h1>
      <p className="mb-8 max-w-sm text-base text-text-muted">
        Create a profile to track your quiz history, scores, and progress over
        time.
      </p>
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        Create Your Profile →
      </Link>
    </div>
  )
}

// ─── Dashboard header ──────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  username: string
  createdAt: string
}

function DashboardHeader({ username, createdAt }: DashboardHeaderProps) {
  const initial = username.charAt(0).toUpperCase()
  return (
    <div className="mb-8 flex items-center gap-5">
      {/* Avatar */}
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-600 text-2xl font-black text-white shadow-md shadow-primary-500/20 ring-4 ring-primary-100">
        {initial}
      </div>
      <div>
        <h1 className="text-2xl font-black text-text sm:text-3xl">{username}</h1>
        <p className="mt-0.5 text-sm text-text-muted">
          Member since {formatDate(createdAt)}
        </p>
      </div>
    </div>
  )
}

// ─── Stats grid ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string
  value: string | number
  label: string
  sub?: string
  accent: string
}

function StatCard({ icon, value, label, sub, accent }: StatCardProps) {
  return (
    <div className={`rounded-2xl border bg-surface p-5 shadow-card ${accent}`}>
      <span className="mb-3 inline-block text-2xl" aria-hidden="true">{icon}</span>
      <p className="text-3xl font-black text-text">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-text-muted">{label}</p>
      {sub && <p className="mt-1 text-xs text-text-subtle">{sub}</p>}
    </div>
  )
}

interface StatsGridProps {
  totalAttempts: number
  average: number
  perfectScores: number
  quizzesAvailable: number
}

function StatsGrid({ totalAttempts, average, perfectScores, quizzesAvailable }: StatsGridProps) {
  return (
    <section aria-label="Your stats" className="mb-10">
      <h2 className="mb-4 text-lg font-bold text-text">Overview</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="📝" value={totalAttempts} label="Total Attempts" accent="border-border" />
        <StatCard icon="🎯" value={`${average}%`} label="Average Score" accent="border-primary-200" />
        <StatCard icon="🏆" value={perfectScores} label="Perfect Scores" accent="border-success-200" />
        <StatCard icon="🗂️" value={quizzesAvailable} label="Quizzes Available" accent="border-border" />
      </div>
    </section>
  )
}

// ─── Quiz progress section ─────────────────────────────────────────────────────

interface QuizProgressCardProps {
  quiz: Quiz
  attemptCount: number
  bestScore: number | null
  onStart: (id: string) => void
}

function QuizProgressCard({ quiz, attemptCount, bestScore, onStart }: QuizProgressCardProps) {
  const meta = getCategoryMeta(quiz.category)
  const attempted = bestScore !== null

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      {/* Top row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${meta.bg} ${meta.border} border`}
            aria-hidden="true"
          >
            {meta.emoji}
          </span>
          <div>
            <h3 className="text-sm font-bold text-text">{quiz.title}</h3>
            <p className="text-xs text-text-subtle">
              {quiz.questions.length} questions
            </p>
          </div>
        </div>
        <button
          onClick={() => onStart(quiz.id)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
            attempted
              ? 'border border-border bg-surface text-text hover:border-primary-300 hover:text-primary-600'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {attempted ? 'Retake' : 'Start'}
        </button>
      </div>

      {/* Attempt count */}
      <p className="mb-2 text-xs text-text-subtle">
        {attempted ? `${attemptCount} ${attemptCount === 1 ? 'attempt' : 'attempts'}` : 'Not started'}
      </p>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Best score</span>
          {attempted && (
            <span className={`text-xs font-bold ${scoreBarColor(bestScore!).replace('bg-', 'text-')}`}>
              {bestScore}%
            </span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full transition-all duration-700 ${attempted ? scoreBarColor(bestScore!) : 'bg-border'}`}
            style={{ width: attempted ? `${bestScore}%` : '0%' }}
            role="progressbar"
            aria-valuenow={bestScore ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={attempted ? `Best score ${bestScore}%` : 'Not attempted'}
          />
        </div>
      </div>
    </div>
  )
}

interface QuizProgressSectionProps {
  quizzes: Quiz[]
  loading: boolean
  getBestScore: (id: string) => number | null
  getAttemptCount: (id: string) => number
  onStart: (id: string) => void
}

function QuizProgressSection({
  quizzes,
  loading,
  getBestScore,
  getAttemptCount,
  onStart,
}: QuizProgressSectionProps) {
  return (
    <section aria-labelledby="quiz-progress-heading" className="mb-10">
      <h2 id="quiz-progress-heading" className="mb-4 text-lg font-bold text-text">
        Quiz Progress
      </h2>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizProgressCard
              key={quiz.id}
              quiz={quiz}
              attemptCount={getAttemptCount(quiz.id)}
              bestScore={getBestScore(quiz.id)}
              onStart={onStart}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Recent activity ───────────────────────────────────────────────────────────

interface ActivityRowProps {
  attempt: QuizAttempt
  index: number
}

/** Valid inside <tbody>: desktop-only table row */
function ActivityTableRow({ attempt, index }: ActivityRowProps) {
  const fb = getFeedbackClasses(attempt.feedback)
  const meta = getCategoryMeta(attempt.category)
  const isEven = index % 2 === 0

  return (
    <tr className={isEven ? 'bg-surface' : 'bg-surface-alt'}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base" aria-hidden="true">{meta.emoji}</span>
          <span className="text-sm font-medium text-text">{attempt.quizTitle}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-block text-sm font-bold ${scoreBarColor(attempt.score).replace('bg-', 'text-')}`}>
          {attempt.score}%
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${fb.bg} ${fb.border} ${fb.text}`}>
          {attempt.feedback}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-xs text-text-subtle">
        {formatDate(attempt.completedAt)}
      </td>
    </tr>
  )
}

/** Mobile-only activity card (rendered outside <table>) */
function ActivityCard({ attempt, index }: ActivityRowProps) {
  const fb = getFeedbackClasses(attempt.feedback)
  const meta = getCategoryMeta(attempt.category)
  const isEven = index % 2 === 0

  return (
    <div className={`flex items-center justify-between rounded-xl border border-border p-4 ${isEven ? 'bg-surface' : 'bg-surface-alt'}`}>
      <div className="flex items-center gap-3">
        <span className="text-xl" aria-hidden="true">{meta.emoji}</span>
        <div>
          <p className="text-sm font-semibold text-text">{attempt.quizTitle}</p>
          <p className="text-xs text-text-subtle">{formatDate(attempt.completedAt)}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`text-sm font-black ${scoreBarColor(attempt.score).replace('bg-', 'text-')}`}>
          {attempt.score}%
        </span>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${fb.bg} ${fb.border} ${fb.text}`}>
          {attempt.feedback}
        </span>
      </div>
    </div>
  )
}

interface RecentActivityProps {
  attempts: QuizAttempt[]
}

function RecentActivity({ attempts }: RecentActivityProps) {
  const recent = attempts.slice(0, 10)
  return (
    <section aria-labelledby="activity-heading" className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="activity-heading" className="text-lg font-bold text-text">Recent Activity</h2>
        {attempts.length > 10 && (
          <span className="text-xs text-text-subtle">{attempts.length} total attempts</span>
        )}
      </div>

      {/* Desktop table — only valid <tr> elements inside <tbody> */}
      <div className="hidden overflow-hidden rounded-2xl border border-border shadow-card sm:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-surface-alt">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-muted">Quiz</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-text-muted">Score</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-text-muted">Result</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((attempt, i) => (
              <ActivityTableRow key={attempt.id} attempt={attempt} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card stack — plain divs, no table markup */}
      <div className="flex flex-col gap-2 sm:hidden">
        {recent.map((attempt, i) => (
          <ActivityCard key={attempt.id} attempt={attempt} index={i} />
        ))}
      </div>
    </section>
  )
}

// ─── No-attempts empty state ───────────────────────────────────────────────────

function NoAttemptsState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
      <span className="mb-4 text-5xl" aria-hidden="true">🎯</span>
      <p className="mb-2 text-base font-bold text-text">No quizzes taken yet</p>
      <p className="mb-6 text-sm text-text-muted">Take your first quiz to start tracking progress.</p>
      <Link
        to="/quizzes"
        className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        Browse Quizzes
      </Link>
    </div>
  )
}

// ─── Dashboard page ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { profile, attempts, quizzes, dispatch, getBestScore, getQuizAttempts } = useApp()
  const navigate = useNavigate()

  /* Load quizzes if not already in context */
  useEffect(() => {
    if (quizzes.length > 0) return
    fetchQuizzes().then((data) => dispatch({ type: 'SET_QUIZZES', payload: data }))
  }, [quizzes.length, dispatch])

  if (!profile) return <GuestDashboard />

  const avg = avgScore(attempts)
  const perfectScores = attempts.filter((a) => a.score === 100).length

  return (
    <main className="flex flex-1 flex-col px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <DashboardHeader username={profile.username} createdAt={profile.createdAt} />

        <StatsGrid
          totalAttempts={attempts.length}
          average={avg}
          perfectScores={perfectScores}
          quizzesAvailable={quizzes.length}
        />

        <QuizProgressSection
          quizzes={quizzes}
          loading={quizzes.length === 0}
          getBestScore={getBestScore}
          getAttemptCount={(id) => getQuizAttempts(id).length}
          onStart={(id) => navigate(`/quiz/${id}`)}
        />

        {attempts.length === 0 ? (
          <NoAttemptsState />
        ) : (
          <RecentActivity attempts={attempts} />
        )}
      </div>
    </main>
  )
}
