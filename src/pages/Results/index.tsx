import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { fetchQuizById, fetchQuizzes } from '@/api/quizData'
import { getCategoryMeta } from '@/utils/categoryMeta'
import { getFeedbackClasses } from '@/utils/scoring'
import type { Question, QuizAttempt } from '@/types'

// ─── Constants ─────────────────────────────────────────────────────────────────

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const

// ─── Score tier config ─────────────────────────────────────────────────────────

interface ScoreTier {
  emoji: string
  title: string
  message: string
  barColor: string
  scoreColor: string
}

function getScoreTier(score: number): ScoreTier {
  if (score === 100)
    return {
      emoji: '🎯',
      title: 'Perfect Score!',
      message: 'You nailed every single question. Outstanding!',
      barColor: 'bg-success-500',
      scoreColor: 'text-success-600',
    }
  if (score >= 80)
    return {
      emoji: '🏆',
      title: 'Great Job!',
      message: "You've got a solid grasp of this topic. Keep it up!",
      barColor: 'bg-success-500',
      scoreColor: 'text-success-600',
    }
  if (score >= 60)
    return {
      emoji: '💪',
      title: 'Good Effort!',
      message: 'A bit more practice and you\'ll master this.',
      barColor: 'bg-primary-500',
      scoreColor: 'text-primary-600',
    }
  if (score >= 40)
    return {
      emoji: '📚',
      title: 'Needs Review',
      message: 'Keep studying and try again — you\'re making progress.',
      barColor: 'bg-warning-500',
      scoreColor: 'text-warning-600',
    }
  return {
    emoji: '🌱',
    title: "Don't Give Up!",
    message: 'Every attempt brings you closer. Review the explanations and retry.',
    barColor: 'bg-danger-500',
    scoreColor: 'text-danger-600',
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <p className="text-sm font-medium text-text-muted">Loading results…</p>
    </div>
  )
}

function ResultsNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <span className="text-7xl" aria-hidden="true">📭</span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-text">Results not found</h1>
        <p className="text-text-muted">
          This result doesn't exist, or the quiz session was not completed.
        </p>
      </div>
      <Link
        to="/quizzes"
        className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        Browse Quizzes
      </Link>
    </div>
  )
}

// ── Score card ───────────────────────────────────────────────────────────────

interface ScoreCardProps {
  attempt: QuizAttempt
  onRetake: () => void
  onToggleReview: () => void
  showReview: boolean
}

function ScoreCard({ attempt, onRetake, onToggleReview, showReview }: ScoreCardProps) {
  const tier = getScoreTier(attempt.score)
  const feedback = attempt.feedback
  const feedbackCls = getFeedbackClasses(feedback)
  const meta = getCategoryMeta(attempt.category)

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card">
      {/* Coloured top stripe */}
      <div className={`h-1.5 w-full rounded-t-2xl ${tier.barColor}`} />

      <div className="p-6 text-center sm:p-8">
        {/* Category pill */}
        <div className="mb-5 flex justify-center">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.border} ${meta.color}`}>
            <span aria-hidden="true">{meta.emoji}</span>
            {meta.label}
          </span>
        </div>

        {/* Performance emoji */}
        <div className="mb-3 text-6xl" aria-hidden="true">{tier.emoji}</div>

        {/* Feedback label */}
        <span className={`inline-block rounded-full border px-4 py-1 text-sm font-bold ${feedbackCls.bg} ${feedbackCls.border} ${feedbackCls.text}`}>
          {feedback}
        </span>

        {/* Title + message */}
        <h1 className="mt-3 text-3xl font-black text-text">{tier.title}</h1>
        <p className="mt-2 text-base text-text-muted">{tier.message}</p>

        {/* Score display */}
        <div className="my-8 flex items-end justify-center gap-3">
          <span className={`text-7xl font-black leading-none ${tier.scoreColor}`}>
            {attempt.score}
            <span className="text-4xl">%</span>
          </span>
          <span className="mb-2 text-xl font-semibold text-text-subtle">
            {attempt.correctAnswers}/{attempt.totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mx-auto mb-2 max-w-sm">
          <div className="h-3 w-full overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all duration-700 ${tier.barColor}`}
              style={{ width: `${attempt.score}%` }}
              role="progressbar"
              aria-valuenow={attempt.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Score: ${attempt.score}%`}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-text-subtle">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Completion date */}
        <p className="mb-8 text-xs text-text-subtle">
          Completed {formatDate(attempt.completedAt)}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onRetake}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary-500/25 transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Retake Quiz
          </button>

          <button
            onClick={onToggleReview}
            aria-expanded={showReview}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
              showReview
                ? 'border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100'
                : 'border-border bg-surface text-text hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            {showReview ? 'Hide Review' : 'Review Answers'}
          </button>

          <Link
            to="/quizzes"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-text transition hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            All Quizzes
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Answer review ────────────────────────────────────────────────────────────

interface ReviewItemProps {
  index: number
  question: Question
  answer: { selectedOption: number; isCorrect: boolean }
}

function ReviewItem({ index, question, answer }: ReviewItemProps) {
  const [open, setOpen] = useState(false)
  const selectedText = question.options[answer.selectedOption] ?? '—'
  const correctText = question.options[question.correctAnswer] ?? '—'
  const selectedLetter = OPTION_LETTERS[answer.selectedOption] ?? '?'
  const correctLetter = OPTION_LETTERS[question.correctAnswer] ?? '?'

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all ${
        answer.isCorrect ? 'border-success-200 bg-success-50/40' : 'border-danger-200 bg-danger-50/40'
      }`}
    >
      {/* Header row — always visible, clickable to expand */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-4 p-4 text-left transition hover:opacity-90"
      >
        {/* Q number + status icon */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span className="text-xs font-bold text-text-subtle">Q{index + 1}</span>
          {answer.isCorrect ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-600" viewBox="0 0 20 20" fill="currentColor" aria-label="Correct">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger-600" viewBox="0 0 20 20" fill="currentColor" aria-label="Incorrect">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.707-7.707a1 1 0 011.414-1.414L10 10.586l2.293-2.293a1 1 0 011.414 1.414L11.414 12l2.293 2.293a1 1 0 01-1.414 1.414L10 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 12l-2.293-2.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Question text + answer summary */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-text">{question.question}</p>
          <p className={`mt-1.5 text-xs font-medium ${answer.isCorrect ? 'text-success-700' : 'text-danger-700'}`}>
            Your answer: {selectedLetter}. {selectedText}
          </p>
        </div>

        {/* Expand chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`mt-0.5 h-4 w-4 shrink-0 text-text-subtle transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-inherit px-4 pb-4 pt-3 space-y-3">
          {/* Correct answer (only if wrong) */}
          {!answer.isCorrect && (
            <div className="flex items-start gap-2 rounded-lg border border-success-200 bg-success-50 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-success-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-bold text-success-700">Correct Answer</p>
                <p className="text-sm text-success-800">{correctLetter}. {correctText}</p>
              </div>
            </div>
          )}

          {/* All options */}
          <div className="space-y-1.5">
            {question.options.map((opt, i) => {
              const isCorrectOpt = i === question.correctAnswer
              const isSelectedOpt = i === answer.selectedOption
              const letter = OPTION_LETTERS[i] ?? String(i + 1)
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                    isCorrectOpt
                      ? 'bg-success-100 font-semibold text-success-800'
                      : isSelectedOpt && !isCorrectOpt
                        ? 'bg-danger-100 font-medium text-danger-800 line-through opacity-80'
                        : 'text-text-muted'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCorrectOpt
                        ? 'bg-success-600 text-white'
                        : isSelectedOpt
                          ? 'bg-danger-500 text-white'
                          : 'bg-border text-text-subtle'
                    }`}
                    aria-hidden="true"
                  >
                    {letter}
                  </span>
                  {opt}
                </div>
              )
            })}
          </div>

          {/* Explanation */}
          <div className="rounded-lg border border-primary-200 bg-primary-50 p-3">
            <div className="flex items-start gap-2">
              <span className="text-base" aria-hidden="true">📖</span>
              <div>
                <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-primary-600">Explanation</p>
                <p className="text-sm leading-relaxed text-primary-800">{question.explanation}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface AnswerReviewProps {
  attempt: QuizAttempt
  questions: Question[]
}

function AnswerReview({ attempt, questions }: AnswerReviewProps) {
  const correct = attempt.answers.filter((a) => a.isCorrect).length
  const total = attempt.answers.length

  // Build a lookup map from questionId → full Question object
  const questionMap = new Map(questions.map((q) => [q.id, q]))

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-card">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">Answer Review</h2>
        <span className="text-sm font-medium text-text-muted">
          {correct}/{total} correct
        </span>
      </div>

      <div className="space-y-3">
        {attempt.answers.map((answer, i) => {
          const question = questionMap.get(answer.questionId)
          if (!question) return null
          return (
            <ReviewItem
              key={answer.questionId}
              index={i}
              question={question}
              answer={answer}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface ResultsLocationState {
  attempt: QuizAttempt
  questions: Question[]
}

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { attempts, quizzes, dispatch } = useApp()

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    const state = location.state as ResultsLocationState | null

    // ── Fast path: came directly from Quiz page ─────────────────────────────
    if (state?.attempt && state?.questions) {
      setAttempt(state.attempt)
      setQuestions(state.questions)
      setLoading(false)
      return
    }

    // ── Slow path: direct URL / page refresh ───────────────────────────────
    if (!attemptId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    // Find the attempt record (may already be in context from localStorage hydration)
    const foundAttempt = attempts.find((a) => a.id === attemptId) ?? state?.attempt ?? null
    if (!foundAttempt) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setAttempt(foundAttempt)

    // Find questions: prefer context quizzes, fallback to API
    const cachedQuiz = quizzes.find((q) => q.id === foundAttempt.quizId)
    if (cachedQuiz) {
      setQuestions(cachedQuiz.questions)
      setLoading(false)
      return
    }

    fetchQuizById(foundAttempt.quizId).then((quiz) => {
      if (quiz) {
        setQuestions(quiz.questions)
        if (quizzes.length === 0) {
          fetchQuizzes().then((all) => dispatch({ type: 'SET_QUIZZES', payload: all }))
        }
      }
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId])

  if (loading) return <LoadingState />
  if (notFound || !attempt) return <ResultsNotFound />

  return (
    <main className="flex flex-1 flex-col px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <ScoreCard
          attempt={attempt}
          showReview={showReview}
          onRetake={() => navigate(`/quiz/${attempt.quizId}`)}
          onToggleReview={() => setShowReview((s) => !s)}
        />

        {showReview && questions.length > 0 && (
          <AnswerReview attempt={attempt} questions={questions} />
        )}
      </div>
    </main>
  )
}
