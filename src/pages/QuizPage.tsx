import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchQuizById } from '../api/quizData'
import { useApp } from '../context/AppContext'
import type { Quiz, QuizAnswer, QuizQuestion } from '../types'

function shuffleQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const copy = [...questions]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function createAttemptId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `attempt-${Date.now()}`
}

export function QuizPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, addAttempt } = useApp()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [showFeedback, setShowFeedback] = useState<boolean>(false)
  const [learnMode, setLearnMode] = useState<boolean>(false)

  useEffect(() => {
    const quizId = id ?? ''
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAnswers([])
    setShowFeedback(false)

    void fetchQuizById(quizId)
      .then((data) => {
        setQuiz(data)
        setShuffledQuestions(data ? shuffleQuestions(data.questions) : [])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [id])

  const totalQuestions = shuffledQuestions.length
  const currentQuestion = shuffledQuestions[currentIndex] ?? null

  const latestAnswer = useMemo(
    () => (currentQuestion ? answers.find((answer) => answer.questionId === currentQuestion.id) : null),
    [answers, currentQuestion],
  )

  const canSubmitCurrent = selectedAnswer !== null && !showFeedback

  function handleSubmitAnswer() {
    if (!currentQuestion || selectedAnswer === null || showFeedback) return

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
      },
    ])
    setShowFeedback(true)
  }

  function handleNextQuestion() {
    if (!showFeedback) return

    setCurrentIndex((prev) => prev + 1)
    setSelectedAnswer(null)
    setShowFeedback(false)
  }

  function handleFinishQuiz() {
    if (!quiz) return

    const score = answers.reduce(
      (total, answer) => total + (answer.isCorrect ? 1 : 0),
      0,
    )
    const percentage = Math.round((score / totalQuestions) * 100)
    const attemptId = createAttemptId()

    addAttempt({
      id: attemptId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      userId: user?.id ?? 'guest',
      answers,
      score,
      totalQuestions,
      percentage,
      createdAt: new Date().toISOString(),
    })

    navigate(`/results/${attemptId}`)
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm">
        <p className="text-slate-600">Loading quiz...</p>
      </section>
    )
  }

  if (!quiz || totalQuestions === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Quiz not found</h1>
        <p className="mt-2 text-slate-600">
          We could not load this quiz. Please try another category.
        </p>
        <Link
          to="/quizzes"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Back to quizzes
        </Link>
      </section>
    )
  }

  const submittedAnswer = latestAnswer
  const isCurrentCorrect = submittedAnswer?.isCorrect ?? false

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm sm:p-8">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{quiz.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={learnMode}
            onChange={(event) => setLearnMode(event.target.checked)}
          />
          Learn mode
        </label>
      </header>

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold text-slate-900">
          {currentQuestion?.question}
        </h2>

        <div className="mt-4 space-y-2">
          {currentQuestion?.options.map((option, optionIndex) => {
            const isSelected = selectedAnswer === optionIndex
            const isCorrectOption = showFeedback && optionIndex === currentQuestion.correctAnswer
            const isWrongSelected =
              showFeedback && isSelected && optionIndex !== currentQuestion.correctAnswer

            return (
              <button
                key={`${currentQuestion.id}-${optionIndex}`}
                type="button"
                disabled={showFeedback}
                onClick={() => setSelectedAnswer(optionIndex)}
                className={[
                  'w-full rounded-lg border px-4 py-3 text-left text-sm transition',
                  isCorrectOption
                    ? 'border-success bg-success/10 text-slate-900'
                    : isWrongSelected
                      ? 'border-danger bg-danger/10 text-slate-900'
                      : isSelected
                        ? 'border-primary bg-primary/5 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-primary/45',
                ].join(' ')}
              >
                {option}
              </button>
            )
          })}
        </div>

        {(learnMode || showFeedback) && (
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Explanation</p>
            <p className="mt-1 text-sm text-slate-600">{currentQuestion?.explanation}</p>
          </div>
        )}

        {showFeedback && (
          <p
            className={[
              'mt-4 text-sm font-medium',
              isCurrentCorrect ? 'text-success' : 'text-danger',
            ].join(' ')}
          >
            {isCurrentCorrect ? 'Correct answer!' : 'Incorrect answer.'}
          </p>
        )}
      </article>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubmitAnswer}
          disabled={!canSubmitCurrent}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition enabled:hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit
        </button>

        {showFeedback && (
          <button
            type="button"
            onClick={currentIndex + 1 === totalQuestions ? handleFinishQuiz : handleNextQuestion}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
          >
            {currentIndex + 1 === totalQuestions ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </section>
  )
}
