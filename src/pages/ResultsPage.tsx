import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchQuizById } from '../api/quizData'
import { useApp } from '../context/AppContext'
import type { Quiz } from '../types'

function getFeedbackLabel(percentage: number): string {
  if (percentage >= 90) return 'Excellent'
  if (percentage >= 75) return 'Good job'
  if (percentage >= 50) return "You're getting there"
  return 'Keep practicing'
}

function getPerformanceMessage(percentage: number): string {
  if (percentage >= 90) {
    return 'Outstanding work. You have a strong understanding of this topic.'
  }
  if (percentage >= 75) {
    return 'Great progress. You are building consistent AI development knowledge.'
  }
  if (percentage >= 50) {
    return 'Solid start. Review the explanations and retake to improve your score.'
  }
  return 'Keep practicing. Focus on the explanations and try again.'
}

function getProgressBarClass(percentage: number): string {
  if (percentage >= 75) return 'bg-success'
  if (percentage >= 50) return 'bg-warning'
  return 'bg-danger'
}

export function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const { attempts } = useApp()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false)
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({})
  const reviewSectionRef = useRef<HTMLElement | null>(null)

  const attempt = useMemo(
    () => attempts.find((item) => item.id === id) ?? null,
    [attempts, id],
  )

  useEffect(() => {
    if (!attempt) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    void fetchQuizById(attempt.quizId)
      .then((data) => {
        setQuiz(data)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [attempt])

  if (!attempt) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Result not found</h1>
        <p className="mt-2 text-slate-600">
          This attempt is missing from local state. It may have been cleared from
          storage or the result link is no longer valid.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/quizzes"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
          >
            Back to quizzes
          </Link>
          <Link
            to="/dashboard"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
          >
            Open dashboard
          </Link>
        </div>
      </section>
    )
  }

  const percentage = Math.max(0, Math.min(100, attempt.percentage))

  function toggleReviewAnswers() {
    setIsReviewOpen((prev) => {
      const next = !prev
      if (!prev && reviewSectionRef.current) {
        window.requestAnimationFrame(() => {
          reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
      return next
    })
  }

  function toggleAnswer(questionId: number) {
    setExpandedAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  return (
    <section className="space-y-5">
      <article className="rounded-2xl border border-slate-200 bg-white/85 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Results</h1>
        <p className="mt-2 text-slate-600">{attempt.quizTitle}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Score</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {attempt.score}/{attempt.totalQuestions}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Percentage</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {percentage}%
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Feedback</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {getFeedbackLabel(percentage)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-500">Performance</span>
            <span className="font-medium text-slate-700">{percentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${getProgressBarClass(percentage)}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {getPerformanceMessage(percentage)}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/quiz/${attempt.quizId}`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
          >
            Retake quiz
          </Link>
          <button
            type="button"
            onClick={toggleReviewAnswers}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
          >
            {isReviewOpen ? 'Hide review answers' : 'Review answers'}
          </button>
          <Link
            to="/quizzes"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
          >
            Back to quizzes
          </Link>
        </div>
      </article>

      {isReviewOpen && (
        <article
          ref={reviewSectionRef}
          className="rounded-2xl border border-slate-200 bg-white/85 p-8 shadow-sm"
        >
          <h2 className="text-2xl font-semibold text-slate-900">Answer review</h2>
          {isLoading ? (
            <p className="mt-3 text-slate-600">Loading review...</p>
          ) : (
            <div className="mt-4 space-y-3">
              {attempt.answers.map((answer) => {
                const question = quiz?.questions.find((item) => item.id === answer.questionId)
                const isExpanded = expandedAnswers[answer.questionId] ?? false

                return (
                  <div
                    key={`${attempt.id}-${answer.questionId}`}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {question?.question ?? `Question #${answer.questionId}`}
                        </p>
                        <p
                          className={[
                            'mt-1 text-sm font-medium',
                            answer.isCorrect ? 'text-success' : 'text-danger',
                          ].join(' ')}
                        >
                          {answer.isCorrect ? 'Correct' : 'Incorrect'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAnswer(answer.questionId)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-primary hover:text-primary"
                      >
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </button>
                    </div>

                    {isExpanded && question && (
                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <p className="text-sm text-slate-600">
                          Your answer:{' '}
                          <span className="font-medium text-slate-900">
                            {question.options[answer.selectedAnswer]}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Correct answer:{' '}
                          <span className="font-medium text-slate-900">
                            {question.options[question.correctAnswer]}
                          </span>
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </article>
      )}
    </section>
  )
}
