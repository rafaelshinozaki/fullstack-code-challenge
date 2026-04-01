import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { useApp } from '@/context/AppContext'
import * as quizDataModule from '@/api/quizData'
import ResultsPage from '@/pages/Results'
import { renderAtRoute } from '@/test/helpers/renderWithProviders'
import { makeAppContext, mockAttempt, mockAttempt80, mockQuiz } from '@/test/fixtures'

vi.mock('@/context/AppContext', () => ({ useApp: vi.fn() }))
vi.mock('@/api/quizData', () => ({
  fetchQuizById: vi.fn(),
  fetchQuizzes: vi.fn().mockResolvedValue([]),
}))

// ─── Helpers ───────────────────────────────────────────────────────────────────

function renderWithState(
  attempt = mockAttempt,
  questions = mockQuiz.questions,
  ctxOverrides = {},
) {
  vi.mocked(useApp).mockReturnValue(makeAppContext(ctxOverrides))
  return renderAtRoute(
    <ResultsPage />,
    '/results/:attemptId',
    `/results/${attempt.id}`,
    { attempt, questions },
  )
}

function renderWithoutState(ctxOverrides = {}) {
  vi.mocked(useApp).mockReturnValue(makeAppContext(ctxOverrides))
  return renderAtRoute(
    <ResultsPage />,
    '/results/:attemptId',
    '/results/unknown-attempt',
  )
}

beforeEach(() => {
  vi.mocked(quizDataModule.fetchQuizById).mockResolvedValue(mockQuiz)
})

// ─── Score display ─────────────────────────────────────────────────────────────

describe('ResultsPage — score display', () => {
  it('renders the percentage score', async () => {
    renderWithState()
    await screen.findByText('100')
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders the fraction score (correctAnswers/total)', async () => {
    renderWithState()
    await screen.findByText(`${mockAttempt.correctAnswers}/${mockAttempt.totalQuestions}`)
  })

  it('renders "Perfect Score!" title for 100%', async () => {
    renderWithState()
    await screen.findByText('Perfect Score!')
  })

  it('renders "Great Job!" title for 80%', async () => {
    renderWithState(mockAttempt80)
    await screen.findByText('Great Job!')
  })

  it('renders "Needs Review" title for 40% score', async () => {
    const lowAttempt = {
      ...mockAttempt,
      id: 'low-attempt',
      score: 40,
      feedback: 'Needs review' as const,
    }
    renderWithState(lowAttempt)
    await screen.findByText('Needs Review')
  })

  it('renders "Don\'t Give Up!" title for score below 40%', async () => {
    const veryLow = {
      ...mockAttempt,
      id: 'very-low',
      score: 20,
      feedback: 'Needs review' as const,
    }
    renderWithState(veryLow)
    await screen.findByText("Don't Give Up!")
  })

  it('displays the quiz title in the category pill', async () => {
    renderWithState()
    // The category meta maps 'agent-fundamentals' → 'Agent Fundamentals'
    await screen.findByText('Agent Fundamentals')
  })
})

// ─── Action buttons ────────────────────────────────────────────────────────────

describe('ResultsPage — action buttons', () => {
  it('renders the "Retake Quiz" button', async () => {
    renderWithState()
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /retake quiz/i }),
      ).toBeInTheDocument()
    })
  })

  it('renders the "Review Answers" toggle button', async () => {
    renderWithState()
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /review answers/i }),
      ).toBeInTheDocument()
    })
  })

  it('renders a link to all quizzes', async () => {
    renderWithState()
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /all quizzes/i }),
      ).toBeInTheDocument()
    })
  })
})

// ─── Review section toggle ─────────────────────────────────────────────────────

describe('ResultsPage — review answers', () => {
  it('review section is hidden initially', async () => {
    renderWithState()
    await screen.findByText('Perfect Score!')
    expect(screen.queryByText('Answer Review')).not.toBeInTheDocument()
  })

  it('shows the review section when the toggle is clicked', async () => {
    renderWithState()
    await screen.findByText('Perfect Score!')
    fireEvent.click(screen.getByRole('button', { name: /review answers/i }))
    expect(screen.getByText('Answer Review')).toBeInTheDocument()
  })

  it('shows each question in the review', async () => {
    renderWithState()
    await screen.findByText('Perfect Score!')
    fireEvent.click(screen.getByRole('button', { name: /review answers/i }))
    expect(screen.getByText(mockQuiz.questions[0].question)).toBeInTheDocument()
    expect(screen.getByText(mockQuiz.questions[1].question)).toBeInTheDocument()
  })

  it('hides the review section when toggled again', async () => {
    renderWithState()
    await screen.findByText('Perfect Score!')
    const toggle = screen.getByRole('button', { name: /review answers/i })
    fireEvent.click(toggle)
    fireEvent.click(screen.getByRole('button', { name: /hide review/i }))
    expect(screen.queryByText('Answer Review')).not.toBeInTheDocument()
  })
})

// ─── Fallback — no state or attempt ───────────────────────────────────────────

describe('ResultsPage — not found fallback', () => {
  it('shows "Results not found" when there is no location state and no matching attempt', async () => {
    renderWithoutState({ attempts: [] })
    await screen.findByText('Results not found')
  })

  it('shows a link to browse quizzes in the fallback state', async () => {
    renderWithoutState({ attempts: [] })
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /browse quizzes/i }),
      ).toBeInTheDocument()
    })
  })

  it('recovers from the fallback when the attempt is in context', async () => {
    vi.mocked(quizDataModule.fetchQuizById).mockResolvedValue(mockQuiz)
    vi.mocked(useApp).mockReturnValue(
      makeAppContext({ attempts: [mockAttempt], quizzes: [mockQuiz] }),
    )
    renderAtRoute(
      <ResultsPage />,
      '/results/:attemptId',
      `/results/${mockAttempt.id}`,
    )
    await screen.findByText('Perfect Score!')
  })
})
