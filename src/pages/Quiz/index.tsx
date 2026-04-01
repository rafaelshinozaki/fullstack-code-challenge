import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { fetchQuizById, fetchQuizzes } from '@/api/quizData'
import { getCategoryMeta } from '@/utils/categoryMeta'
import { calculateScore, getFeedbackLabel } from '@/utils/scoring'
import type { Question, Quiz, UserAnswer, QuizAttempt } from '@/types'

// ─── Constants ─────────────────────────────────────────────────────────────────

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const

// ─── Pure helpers ──────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type OptionState = 'default' | 'selected' | 'correct' | 'wrong' | 'reveal-correct'

function resolveOptionState(
  optionIndex: number,
  selectedOption: number | null,
  correctAnswer: number,
  submitted: boolean,
): OptionState {
  if (!submitted) {
    return optionIndex === selectedOption ? 'selected' : 'default'
  }
  if (optionIndex === correctAnswer) return 'correct'
  if (optionIndex === selectedOption) return 'wrong'
  return 'default'
}

const OPTION_CLASSES: Record<OptionState, string> = {
  default:
    'border-border bg-surface text-text hover:border-primary-300 hover:bg-primary-50/60 cursor-pointer',
  selected:
    'border-primary-500 bg-primary-50 text-text ring-2 ring-primary-200 cursor-pointer',
  correct:
    'border-success-500 bg-success-50 text-success-800 ring-2 ring-success-200 cursor-default',
  wrong:
    'border-danger-500 bg-danger-50 text-danger-800 ring-2 ring-danger-200 cursor-default',
  'reveal-correct':
    'border-success-300 bg-success-50/50 text-success-700 cursor-default opacity-70',
}

const BADGE_CLASSES: Record<OptionState, string> = {
  default: 'bg-surface-alt text-text-muted border border-border',
  selected: 'bg-primary-600 text-white border-transparent',
  correct: 'bg-success-600 text-white border-transparent',
  wrong: 'bg-danger-600 text-white border-transparent',
  'reveal-correct': 'bg-success-400 text-white border-transparent',
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <p className="text-sm font-medium text-text-muted">Loading quiz…</p>
    </div>
  )
}

function QuizNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <span className="text-7xl" aria-hidden="true">🔍</span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-text">Quiz not found</h1>
        <p className="text-text-muted">
          This quiz doesn't exist or may have been removed.
        </p>
      </div>
      <Link
        to="/quizzes"
        className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        ← Back to Quizzes
      </Link>
    </div>
  )
}

// ── Progress header ──────────────────────────────────────────────────────────

interface ProgressHeaderProps {
  quiz: Quiz
  currentIndex: number
  submitted: boolean
  total: number
  learnMode: boolean
  onToggleLearnMode: () => void
}

function ProgressHeader({
  quiz,
  currentIndex,
  submitted,
  total,
  learnMode,
  onToggleLearnMode,
}: ProgressHeaderProps) {
  const meta = getCategoryMeta(quiz.category)
  const answered = currentIndex + (submitted ? 1 : 0)
  const progressPct = Math.round((answered / total) * 100)

  return (
    <div className="mb-6 space-y-4">
      {/* Top row: back + category + learn mode */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/quizzes"
          className="flex items-center gap-1.5 text-sm font-medium text-text-muted transition hover:text-text focus-visible:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          All Quizzes
        </Link>

        <div className="flex items-center gap-3">
          {/* Category pill */}
          <span className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold sm:inline-flex ${meta.bg} ${meta.border} ${meta.color}`}>
            <span aria-hidden="true">{meta.emoji}</span>
            {meta.label}
          </span>

          {/* Learn mode toggle */}
          <button
            onClick={onToggleLearnMode}
            aria-pressed={learnMode}
            title={learnMode ? 'Disable learn mode' : 'Enable learn mode'}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              learnMode
                ? 'border-warning-300 bg-warning-50 text-warning-700 hover:bg-warning-100'
                : 'border-border bg-surface text-text-muted hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            <span aria-hidden="true">💡</span>
            Learn Mode
            {/* Toggle switch */}
            <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${learnMode ? 'bg-warning-500' : 'bg-border'}`}>
              <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${learnMode ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Progress bar row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text">
            Question{' '}
            <span className="text-primary-600">{currentIndex + 1}</span>
            {' '}of {total}
          </span>
          <span className="text-xs font-medium text-text-subtle">{progressPct}% complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={answered}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`Question ${currentIndex + 1} of ${total}`}
          />
        </div>
      </div>
    </div>
  )
}

// ── Option button ────────────────────────────────────────────────────────────

interface OptionButtonProps {
  letter: string
  text: string
  state: OptionState
  submitted: boolean
  onClick: () => void
}

function OptionButton({ letter, text, state, submitted, onClick }: OptionButtonProps) {
  return (
    <button
      onClick={!submitted ? onClick : undefined}
      disabled={submitted}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150 disabled:cursor-default ${OPTION_CLASSES[state]}`}
    >
      {/* Letter badge */}
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${BADGE_CLASSES[state]}`}
        aria-hidden="true"
      >
        {letter}
      </span>
      <span className="text-sm font-medium leading-relaxed">{text}</span>

      {/* Correct / wrong icon */}
      {submitted && state === 'correct' && (
        <svg xmlns="http://www.w3.org/2000/svg" className="ml-auto mt-0.5 h-5 w-5 shrink-0 text-success-600" viewBox="0 0 20 20" fill="currentColor" aria-label="Correct">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {submitted && state === 'wrong' && (
        <svg xmlns="http://www.w3.org/2000/svg" className="ml-auto mt-0.5 h-5 w-5 shrink-0 text-danger-600" viewBox="0 0 20 20" fill="currentColor" aria-label="Incorrect">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.707-7.707a1 1 0 011.414-1.414L10 10.586l2.293-2.293a1 1 0 011.414 1.414L11.414 12l2.293 2.293a1 1 0 01-1.414 1.414L10 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 12l-2.293-2.293z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  )
}

// ── Explanation panel ────────────────────────────────────────────────────────

interface ExplanationPanelProps {
  text: string
  isHint: boolean
}

function ExplanationPanel({ text, isHint }: ExplanationPanelProps) {
  return (
    <div
      className={`mt-5 rounded-xl border p-4 ${
        isHint
          ? 'border-warning-200 bg-warning-50'
          : 'border-primary-200 bg-primary-50'
      }`}
      role="note"
      aria-label={isHint ? 'Hint' : 'Explanation'}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg" aria-hidden="true">{isHint ? '💡' : '📖'}</span>
        <div>
          <p className={`mb-1 text-xs font-bold uppercase tracking-wider ${isHint ? 'text-warning-600' : 'text-primary-600'}`}>
            {isHint ? 'Hint (Learn Mode)' : 'Explanation'}
          </p>
          <p className={`text-sm leading-relaxed ${isHint ? 'text-warning-800' : 'text-primary-800'}`}>
            {text}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Action button ────────────────────────────────────────────────────────────

type ActionKind = 'submit-disabled' | 'submit' | 'next' | 'finish'

function ActionButton({ kind, onClick }: { kind: ActionKind; onClick: () => void }) {
  if (kind === 'submit-disabled') {
    return (
      <button disabled className="w-full cursor-not-allowed rounded-xl bg-border py-3.5 text-sm font-semibold text-text-subtle transition">
        Submit Answer
      </button>
    )
  }
  if (kind === 'submit') {
    return (
      <button
        onClick={onClick}
        className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-primary-500/25 transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        Submit Answer
      </button>
    )
  }
  if (kind === 'next') {
    return (
      <button
        onClick={onClick}
        className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-primary-500/25 transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        Next Question →
      </button>
    )
  }
  // finish
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl bg-success-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-success-500/25 transition hover:bg-success-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success-600"
    >
      View Results 🏁
    </button>
  )
}

// ─── Main quiz card ────────────────────────────────────────────────────────────

interface QuizCardProps {
  question: Question
  questionNumber: number
  selectedOption: number | null
  submitted: boolean
  learnMode: boolean
  isLast: boolean
  onSelect: (index: number) => void
  onSubmit: () => void
  onNext: () => void
  onFinish: () => void
}

function QuizCard({
  question,
  questionNumber,
  selectedOption,
  submitted,
  learnMode,
  isLast,
  onSelect,
  onSubmit,
  onNext,
  onFinish,
}: QuizCardProps) {
  const actionKind: ActionKind = !submitted
    ? selectedOption === null
      ? 'submit-disabled'
      : 'submit'
    : isLast
      ? 'finish'
      : 'next'

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
      {/* Question */}
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-subtle">
        Question {questionNumber}
      </p>
      <h2 className="mb-6 text-xl font-bold leading-snug text-text sm:text-2xl">
        {question.question}
      </h2>

      {/* Learn mode hint — shown BEFORE submitting */}
      {learnMode && !submitted && (
        <ExplanationPanel text={question.explanation} isHint />
      )}

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((text, i) => {
          const state = resolveOptionState(i, selectedOption, question.correctAnswer, submitted)
          return (
            <OptionButton
              key={i}
              letter={OPTION_LETTERS[i] ?? String(i + 1)}
              text={text}
              state={state}
              submitted={submitted}
              onClick={() => onSelect(i)}
            />
          )
        })}
      </div>

      {/* Explanation — shown AFTER submitting */}
      {submitted && (
        <ExplanationPanel text={question.explanation} isHint={false} />
      )}

      {/* Action button */}
      <div className="mt-6">
        <ActionButton
          kind={actionKind}
          onClick={
            actionKind === 'submit'
              ? onSubmit
              : actionKind === 'next'
                ? onNext
                : onFinish
          }
        />
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const { quizzes, dispatch, addAttempt } = useApp()
  const navigate = useNavigate()

  // ── Data state ────────────────────────────────────────────────────────────────
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [orderedQuestions, setOrderedQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // ── Quiz session state ────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [learnMode, setLearnMode] = useState(false)
  const [collectedAnswers, setCollectedAnswers] = useState<UserAnswer[]>([])

  // ── Load quiz (reset everything when quizId changes) ─────────────────────────
  useEffect(() => {
    setQuiz(null)
    setOrderedQuestions([])
    setCurrentIndex(0)
    setSelectedOption(null)
    setSubmitted(false)
    setCollectedAnswers([])
    setLearnMode(false)
    setLoading(true)
    setNotFound(false)

    if (!quizId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    // Prefer cached data from context (instant, no delay)
    const cached = quizzes.find((q) => q.id === quizId)
    if (cached) {
      setQuiz(cached)
      setOrderedQuestions(shuffle(cached.questions))
      setLoading(false)
      return
    }

    // Fallback: fetch from mock API
    fetchQuizById(quizId).then((q) => {
      if (!q) {
        setNotFound(true)
      } else {
        setQuiz(q)
        setOrderedQuestions(shuffle(q.questions))
        // Hydrate global quiz store if it was empty (direct navigation)
        if (quizzes.length === 0) {
          fetchQuizzes().then((all) => dispatch({ type: 'SET_QUIZZES', payload: all }))
        }
      }
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId])

  // ── Handlers ──────────────────────────────────────────────────────────────────

  function handleSubmit() {
    if (selectedOption === null || !quiz) return
    const question = orderedQuestions[currentIndex]
    const isCorrect = selectedOption === question.correctAnswer
    const answer: UserAnswer = {
      questionId: question.id,
      selectedOption,
      isCorrect,
      answeredAt: new Date().toISOString(),
    }
    setCollectedAnswers((prev) => [...prev, answer])
    setSubmitted(true)
  }

  function handleNext() {
    setSelectedOption(null)
    setSubmitted(false)
    setCurrentIndex((i) => i + 1)
  }

  function handleFinish() {
    if (!quiz) return

    const correctAnswers = collectedAnswers.filter((a) => a.isCorrect).length
    const score = calculateScore(correctAnswers, orderedQuestions.length)
    const feedback = getFeedbackLabel(score)
    const attempt: QuizAttempt = {
      id: crypto.randomUUID(),
      quizId: quiz.id,
      quizTitle: quiz.title,
      category: quiz.category,
      totalQuestions: orderedQuestions.length,
      correctAnswers,
      score,
      feedback,
      answers: collectedAnswers,
      completedAt: new Date().toISOString(),
    }

    addAttempt(attempt)
    navigate(`/results/${attempt.id}`, { state: { attempt, questions: orderedQuestions } })
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) return <LoadingState />
  if (notFound || !quiz) return <QuizNotFound />

  const question = orderedQuestions[currentIndex]
  const total = orderedQuestions.length

  return (
    <main className="flex flex-1 flex-col px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <ProgressHeader
          quiz={quiz}
          currentIndex={currentIndex}
          submitted={submitted}
          total={total}
          learnMode={learnMode}
          onToggleLearnMode={() => setLearnMode((m) => !m)}
        />

        <QuizCard
          question={question}
          questionNumber={currentIndex + 1}
          selectedOption={selectedOption}
          submitted={submitted}
          learnMode={learnMode}
          isLast={currentIndex === total - 1}
          onSelect={(i) => { if (!submitted) setSelectedOption(i) }}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      </div>
    </main>
  )
}
