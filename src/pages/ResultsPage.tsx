import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchQuizById } from '../api/quizData'
import { useApp } from '../context/AppContext'
import type { Quiz, QuizAttempt } from '../types'
import { getAttemptById } from '../utils/storage'

function getPerformanceMessage(percentage: number): string {
  if (percentage === 100) return 'Perfect score! Outstanding work.'
  if (percentage >= 80) return 'Excellent work! You are mastering these concepts.'
  if (percentage >= 60) return "Good job! You're getting there."
  if (percentage >= 40) return 'Keep practicing. You are building momentum.'
  return 'Needs review. Retake the quiz and focus on explanations.'
}

export function ResultsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { attempts } = useApp()
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [expandedReview, setExpandedReview] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (!id) {
      setError('Missing attempt id.')
      setLoading(false)
      return
    }
    const attemptId = id

    let active = true

    async function loadResults() {
      setLoading(true)
      setError(null)

      const foundAttempt =
        attempts.find((item) => item.id === attemptId) ??
        getAttemptById(attemptId)

      if (!foundAttempt) {
        if (active) {
          setError('Attempt not found. It may have been removed.')
          setLoading(false)
        }
        return
      }

      try {
        const quizData = await fetchQuizById(foundAttempt.quizId)
        if (active) {
          setAttempt(foundAttempt)
          setQuiz(quizData)
          setExpandedReview({})
        }
      } catch {
        if (active) {
          setAttempt(foundAttempt)
          setError('Quiz details are unavailable for this attempt.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadResults()
    return () => {
      active = false
    }
  }, [attempts, id])

  const percentage = attempt?.percentage ?? 0
  const performanceMessage = useMemo(() => getPerformanceMessage(percentage), [percentage])

  function toggleReviewDetails(questionId: number): void {
    setExpandedReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  if (loading) {
    return <p className="text-text-muted">Loading results...</p>
  }

  if (error || !attempt) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold text-text-base">Quiz Results</h1>
        <p className="text-danger-600">{error ?? 'Result not available.'}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/quizzes"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Back to quizzes
          </Link>
          <Link to="/dashboard" className="text-sm font-medium text-primary-700 hover:underline">
            Go to dashboard
          </Link>
        </div>
      </section>
    )
  }

  const progressBarColor =
    percentage >= 80
      ? 'bg-success-600'
      : percentage >= 60
        ? 'bg-primary-600'
        : percentage >= 40
          ? 'bg-warning-600'
          : 'bg-danger-600'

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-text-base">Quiz Results</h1>
        <p className="text-sm text-text-muted">{attempt.quizTitle}</p>
      </header>

      <article className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-text-muted">Score</p>
            <p className="text-3xl font-bold text-text-base">
              {attempt.score}/{attempt.total}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-muted">Percentage</p>
            <p className="text-3xl font-bold text-primary-700">{percentage}%</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm text-text-muted">
            <span>Performance</span>
            <span>{percentage}% complete</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full rounded-full transition-all ${progressBarColor}`} style={{ width: `${percentage}%` }} />
          </div>
          <p className="mt-3 text-sm font-medium text-text-base">{performanceMessage}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/quiz/${attempt.quizId}`)}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Retake
          </button>
          <button
            type="button"
            onClick={() => setShowReview((prev) => !prev)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-base hover:border-primary-300 hover:text-primary-700"
          >
            {showReview ? 'Hide review answers' : 'Review answers'}
          </button>
          <Link
            to="/quizzes"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-base hover:border-primary-300 hover:text-primary-700"
          >
            Back to quizzes
          </Link>
        </div>
      </article>

      {showReview && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-text-base">Answer Review</h2>

          {!quiz ? (
            <p className="text-sm text-text-muted">Detailed review is unavailable for this quiz.</p>
          ) : (
            <div className="space-y-3">
              {quiz.questions.map((question) => {
                const answer = attempt.answers.find((item) => item.questionId === question.id)
                const selectedOptionText =
                  answer && question.options[answer.selectedOption]
                    ? question.options[answer.selectedOption]
                    : 'No answer selected'
                const correctOptionText = question.options[question.correctAnswer]
                const isExpanded = expandedReview[question.id] ?? false

                return (
                  <article key={question.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text-base">{question.question}</p>
                        <p
                          className={`mt-1 text-xs font-medium ${
                            answer?.isCorrect ? 'text-success-700' : 'text-danger-700'
                          }`}
                        >
                          {answer?.isCorrect ? 'Correct' : 'Incorrect'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleReviewDetails(question.id)}
                        className="text-xs font-semibold text-primary-700 hover:underline"
                      >
                        {isExpanded ? 'Hide details' : 'Show details'}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 text-sm">
                        <p className="text-text-muted">
                          <span className="font-medium text-text-base">Your answer:</span> {selectedOptionText}
                        </p>
                        <p className="text-text-muted">
                          <span className="font-medium text-text-base">Correct answer:</span> {correctOptionText}
                        </p>
                        <p className="text-text-muted">
                          <span className="font-medium text-text-base">Explanation:</span> {question.explanation}
                        </p>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      <div className="text-xs text-text-muted">
        Attempt id: <span className="font-mono">{id ?? 'unknown'}</span>
      </div>
    </section>
  )
}
