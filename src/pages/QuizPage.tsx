import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchQuizById } from '../api/quizData'
import { useApp } from '../context/AppContext'
import type { AnswerRecord, Quiz, QuizQuestion } from '../types'

function shuffleQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const copy = [...questions]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }
  return copy
}

function createAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `attempt-${Date.now()}`
}

export function QuizPage() {
  const navigate = useNavigate()
  const { addAttempt } = useApp()
  const { id } = useParams<{ id: string }>()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [learnMoreOpen, setLearnMoreOpen] = useState(false)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])

  useEffect(() => {
    if (!id) {
      setError('Missing quiz id.')
      setLoading(false)
      return
    }
    const quizId = id

    let active = true

    async function loadQuiz() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchQuizById(quizId)
        if (active) {
          setQuiz(data)
          setShuffledQuestions(shuffleQuestions(data.questions))
          setCurrentIndex(0)
          setSelectedOption(null)
          setSubmitted(false)
          setLearnMoreOpen(false)
          setAnswers([])
        }
      } catch {
        if (active) setError('Quiz not found.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadQuiz()
    return () => {
      active = false
    }
  }, [id])

  if (loading) return <p className="text-text-muted">Loading quiz...</p>

  if (error || !quiz) {
    return (
      <section className="space-y-3">
        <p className="text-danger-600">{error ?? 'Quiz unavailable.'}</p>
        <Link to="/quizzes" className="text-sm font-medium text-primary-700 hover:underline">
          Back to quizzes
        </Link>
      </section>
    )
  }

  const totalQuestions = shuffledQuestions.length
  const currentQuestion = shuffledQuestions[currentIndex]
  const progressPercent =
    totalQuestions === 0 ? 0 : Math.round(((currentIndex + 1) / totalQuestions) * 100)

  if (!currentQuestion) {
    return (
      <section className="space-y-3">
        <p className="text-danger-600">No questions available for this quiz.</p>
        <Link to="/quizzes" className="text-sm font-medium text-primary-700 hover:underline">
          Back to quizzes
        </Link>
      </section>
    )
  }
  const activeQuiz = quiz

  const currentAnswer = answers.find((answer) => answer.questionId === currentQuestion.id)
  const isCurrentCorrect = submitted ? currentAnswer?.isCorrect ?? false : false

  function handleSubmit(): void {
    if (selectedOption === null) return

    const isCorrect = selectedOption === currentQuestion.correctAnswer
    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect,
    }

    setAnswers((prev) => {
      const withoutCurrent = prev.filter((item) => item.questionId !== currentQuestion.id)
      return [...withoutCurrent, record]
    })
    setSubmitted(true)
  }

  function handleNextOrFinish(): void {
    if (!submitted) return

    const isLastQuestion = currentIndex === totalQuestions - 1
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setSubmitted(false)
      setLearnMoreOpen(false)
      return
    }

    const score = answers.filter((answer) => answer.isCorrect).length
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0
    const attemptId = createAttemptId()

    addAttempt({
      id: attemptId,
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      score,
      total: totalQuestions,
      percentage,
      answers,
      completedAt: new Date().toISOString(),
    })

    navigate(`/results/${attemptId}`)
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold text-text-base">{quiz.title}</h1>
        <p className="text-text-muted">{quiz.description}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-text-muted">
            <span>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-primary-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <article className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-text-base">{currentQuestion.question}</h2>

        <div className="mt-5 grid gap-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index
            const isCorrectOption = submitted && currentQuestion.correctAnswer === index
            const isIncorrectSelected = submitted && isSelected && !isCorrectOption

            return (
              <button
                key={`${currentQuestion.id}-${index}`}
                type="button"
                disabled={submitted}
                onClick={() => setSelectedOption(index)}
                className={[
                  'w-full rounded-xl border px-4 py-3 text-left text-sm transition',
                  isCorrectOption
                    ? 'border-success-300 bg-success-50 text-success-700'
                    : isIncorrectSelected
                      ? 'border-danger-300 bg-danger-50 text-danger-700'
                      : isSelected
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-border bg-white text-text-base hover:border-primary-300 hover:bg-primary-50',
                  submitted ? 'cursor-default' : 'cursor-pointer',
                ].join(' ')}
              >
                {option}
              </button>
            )
          })}
        </div>

        {submitted && (
          <div className="mt-5 rounded-xl border border-border bg-slate-50 p-4">
            <p className={isCurrentCorrect ? 'font-semibold text-success-700' : 'font-semibold text-danger-700'}>
              {isCurrentCorrect ? 'Correct answer.' : 'Incorrect answer.'}
            </p>

            <button
              type="button"
              onClick={() => setLearnMoreOpen((prev) => !prev)}
              className="mt-2 text-sm font-medium text-primary-700 hover:underline"
            >
              {learnMoreOpen ? 'Hide explanation' : 'Learn more'}
            </button>

            {learnMoreOpen && (
              <p className="mt-2 text-sm text-text-muted">{currentQuestion.explanation}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-primary-700"
            >
              Submit
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextOrFinish}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
            </button>
          )}

          <Link to="/quizzes" className="text-sm font-medium text-text-muted hover:text-primary-700">
            Back to quizzes
          </Link>
        </div>
      </article>

      <p className="text-xs text-text-muted">
        Answers saved this run: {answers.length} / {totalQuestions}
      </p>
    </section>
  )
}
