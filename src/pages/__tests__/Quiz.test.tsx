import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { useApp } from '@/context/AppContext'
import * as quizDataModule from '@/api/quizData'
import QuizPage from '@/pages/Quiz'
import { renderAtRoute } from '@/test/helpers/renderWithProviders'
import { makeAppContext, mockQuiz } from '@/test/fixtures'

vi.mock('@/context/AppContext', () => ({ useApp: vi.fn() }))
vi.mock('@/api/quizData', () => ({
  fetchQuizById: vi.fn(),
  fetchQuizzes: vi.fn().mockResolvedValue([]),
}))

// ─── Helpers ───────────────────────────────────────────────────────────────────

const Q1 = mockQuiz.questions[0] // correctAnswer: 0 — "Artificial Intelligence"
const Q2 = mockQuiz.questions[1] // correctAnswer: 1 — "A computational model"

function renderQuiz(quizId = 'test-quiz', ctxOverrides = {}) {
  vi.mocked(useApp).mockReturnValue(makeAppContext(ctxOverrides))
  return renderAtRoute(
    <QuizPage />,
    '/quiz/:quizId',
    `/quiz/${quizId}`,
  )
}

// ─── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(quizDataModule.fetchQuizById).mockResolvedValue(mockQuiz)
  vi.mocked(quizDataModule.fetchQuizzes).mockResolvedValue([])
  // Math.random = 0.9 keeps Fisher-Yates from reordering a ≤5-element array,
  // so orderedQuestions[0] === Q1 and orderedQuestions[1] === Q2.
  vi.spyOn(Math, 'random').mockReturnValue(0.9)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── Loading ───────────────────────────────────────────────────────────────────

describe('QuizPage — loading', () => {
  it('shows the loading spinner before the quiz resolves', () => {
    vi.mocked(quizDataModule.fetchQuizById).mockReturnValue(
      new Promise(() => {}),
    )
    renderQuiz()
    expect(screen.getByText('Loading quiz…')).toBeInTheDocument()
  })
})

// ─── Not found ─────────────────────────────────────────────────────────────────

describe('QuizPage — not found', () => {
  it('shows the "Quiz not found" message for an unknown id', async () => {
    vi.mocked(quizDataModule.fetchQuizById).mockResolvedValue(null)
    renderQuiz('unknown-id')
    await waitFor(() => {
      expect(screen.getByText('Quiz not found')).toBeInTheDocument()
    })
  })

  it('shows a link back to quizzes on the not-found screen', async () => {
    vi.mocked(quizDataModule.fetchQuizById).mockResolvedValue(null)
    renderQuiz('unknown-id')
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /back to quizzes/i }),
      ).toBeInTheDocument()
    })
  })
})

// ─── Loaded — initial render ───────────────────────────────────────────────────

describe('QuizPage — initial render', () => {
  it('renders the first question text after loading', async () => {
    renderQuiz()
    await screen.findByText(Q1.question)
  })

  it('renders all four option texts', async () => {
    renderQuiz()
    await screen.findByText(Q1.question)
    for (const option of Q1.options) {
      expect(screen.getByText(option)).toBeInTheDocument()
    }
  })

  it('shows "of 2" in the progress label', async () => {
    renderQuiz()
    await screen.findByText(Q1.question)
    // The progress span contains "Question", "1" (child span), and "of 2"
    // Use getAllByText to handle the split-text structure, then check one exists
    expect(screen.getByText(/of 2/i)).toBeInTheDocument()
  })

  it('renders the "Submit Answer" button in a disabled state', async () => {
    renderQuiz()
    await screen.findByText(Q1.question)
    expect(
      screen.getByRole('button', { name: /submit answer/i }),
    ).toBeDisabled()
  })
})

// ─── Option selection ──────────────────────────────────────────────────────────

describe('QuizPage — option selection', () => {
  it('enables Submit after clicking an option', async () => {
    renderQuiz()
    await screen.findByText(Q1.question)
    fireEvent.click(screen.getByText(Q1.options[0]))
    expect(
      screen.getByRole('button', { name: /submit answer/i }),
    ).not.toBeDisabled()
  })

  it('allows changing the selection before submitting', async () => {
    renderQuiz()
    await screen.findByText(Q1.question)
    fireEvent.click(screen.getByText(Q1.options[0]))
    fireEvent.click(screen.getByText(Q1.options[2]))
    // Still enabled — a selection exists
    expect(
      screen.getByRole('button', { name: /submit answer/i }),
    ).not.toBeDisabled()
  })
})

// ─── After submit ──────────────────────────────────────────────────────────────

describe('QuizPage — after submit', () => {
  async function submitAnswer(optionIndex: number) {
    renderQuiz()
    await screen.findByText(Q1.question)
    fireEvent.click(screen.getByText(Q1.options[optionIndex]))
    fireEvent.click(screen.getByRole('button', { name: /submit answer/i }))
  }

  it('shows the explanation after submitting', async () => {
    await submitAnswer(0) // correct answer
    expect(screen.getByText(Q1.explanation)).toBeInTheDocument()
  })

  it('changes the action button to "Next Question" on question 1', async () => {
    await submitAnswer(0)
    expect(
      screen.getByRole('button', { name: /next question/i }),
    ).toBeInTheDocument()
  })

  it('options are disabled after submitting', async () => {
    await submitAnswer(0)
    for (const opt of Q1.options) {
      expect(screen.getByText(opt).closest('button')).toBeDisabled()
    }
  })
})

// ─── Navigation between questions ─────────────────────────────────────────────

describe('QuizPage — next question', () => {
  async function goToQuestion2() {
    renderQuiz()
    await screen.findByText(Q1.question)
    fireEvent.click(screen.getByText(Q1.options[0]))
    fireEvent.click(screen.getByRole('button', { name: /submit answer/i }))
    fireEvent.click(screen.getByRole('button', { name: /next question/i }))
  }

  it('renders the second question after clicking Next', async () => {
    await goToQuestion2()
    await screen.findByText(Q2.question)
  })

  it('resets to a disabled Submit button on the new question', async () => {
    await goToQuestion2()
    await screen.findByText(Q2.question)
    expect(
      screen.getByRole('button', { name: /submit answer/i }),
    ).toBeDisabled()
  })
})

// ─── Last question — View Results ─────────────────────────────────────────────

describe('QuizPage — last question', () => {
  async function reachLastQuestion() {
    renderQuiz()
    // Answer Q1
    await screen.findByText(Q1.question)
    fireEvent.click(screen.getByText(Q1.options[0]))
    fireEvent.click(screen.getByRole('button', { name: /submit answer/i }))
    fireEvent.click(screen.getByRole('button', { name: /next question/i }))
    // Submit Q2
    await screen.findByText(Q2.question)
    fireEvent.click(screen.getByText(Q2.options[1]))
    fireEvent.click(screen.getByRole('button', { name: /submit answer/i }))
  }

  it('shows "View Results" button on the last question after submit', async () => {
    await reachLastQuestion()
    expect(
      screen.getByRole('button', { name: /view results/i }),
    ).toBeInTheDocument()
  })

  it('calls addAttempt when "View Results" is clicked', async () => {
    const addAttempt = vi.fn()
    vi.mocked(useApp).mockReturnValue(makeAppContext({ addAttempt }))
    // Suppress the expected React Router 404 when the page navigates to /results/:id
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderAtRoute(<QuizPage />, '/quiz/:quizId', '/quiz/test-quiz')
    // Answer Q1
    await screen.findByText(Q1.question)
    fireEvent.click(screen.getByText(Q1.options[0]))
    fireEvent.click(screen.getByRole('button', { name: /submit answer/i }))
    fireEvent.click(screen.getByRole('button', { name: /next question/i }))
    // Answer Q2
    await screen.findByText(Q2.question)
    fireEvent.click(screen.getByText(Q2.options[1]))
    fireEvent.click(screen.getByRole('button', { name: /submit answer/i }))
    fireEvent.click(screen.getByRole('button', { name: /view results/i }))
    expect(addAttempt).toHaveBeenCalledOnce()
    consoleSpy.mockRestore()
  })
})

// ─── Learn mode ────────────────────────────────────────────────────────────────

describe('QuizPage — Learn Mode', () => {
  it('shows explanation as a hint before submitting when Learn Mode is on', async () => {
    renderQuiz()
    await screen.findByText(Q1.question)
    fireEvent.click(screen.getByRole('button', { name: /learn mode/i }))
    expect(screen.getByLabelText('Hint')).toBeInTheDocument()
  })

  it('hides the hint after toggling Learn Mode off again', async () => {
    renderQuiz()
    await screen.findByText(Q1.question)
    const toggle = screen.getByRole('button', { name: /learn mode/i })
    fireEvent.click(toggle)
    fireEvent.click(toggle)
    expect(screen.queryByLabelText('Hint')).not.toBeInTheDocument()
  })
})
