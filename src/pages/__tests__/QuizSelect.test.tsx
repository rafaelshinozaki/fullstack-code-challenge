import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { useApp } from '@/context/AppContext'
import * as quizDataModule from '@/api/quizData'
import QuizSelect from '@/pages/QuizSelect'
import { renderInRouter } from '@/test/helpers/renderWithProviders'
import { makeAppContext, mockQuiz } from '@/test/fixtures'

vi.mock('@/context/AppContext', () => ({ useApp: vi.fn() }))
vi.mock('@/api/quizData', () => ({
  fetchQuizzes: vi.fn(),
}))

// ─── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Reset call counts so assertions like toHaveBeenCalledOnce() are per-test
  vi.clearAllMocks()
  vi.mocked(quizDataModule.fetchQuizzes).mockResolvedValue([mockQuiz])
})

function renderPage(ctxOverrides = {}) {
  vi.mocked(useApp).mockReturnValue(makeAppContext(ctxOverrides))
  return renderInRouter(<QuizSelect />)
}

// ─── Loading state ─────────────────────────────────────────────────────────────

describe('QuizSelect — loading state', () => {
  it('shows the loading spinner when quizzes have not loaded yet', () => {
    // Never resolves → keeps quizzes empty
    vi.mocked(quizDataModule.fetchQuizzes).mockReturnValue(
      new Promise(() => {}),
    )
    renderPage({ quizzes: [] })
    expect(screen.getByLabelText('Loading quizzes')).toBeInTheDocument()
  })
})

// ─── Loaded state ──────────────────────────────────────────────────────────────

describe('QuizSelect — loaded state', () => {
  it('renders the page heading', () => {
    renderPage({ quizzes: [mockQuiz] })
    expect(
      screen.getByRole('heading', { name: /all quizzes/i }),
    ).toBeInTheDocument()
  })

  it('renders a card for each quiz', () => {
    renderPage({ quizzes: [mockQuiz] })
    expect(screen.getByText(mockQuiz.title)).toBeInTheDocument()
  })

  it('shows quiz description', () => {
    renderPage({ quizzes: [mockQuiz] })
    expect(screen.getByText(mockQuiz.description)).toBeInTheDocument()
  })

  it('shows "Not attempted" badge when quiz has no attempts', () => {
    renderPage({
      quizzes: [mockQuiz],
      getBestScore: vi.fn().mockReturnValue(null),
    })
    expect(screen.getByText('Not attempted')).toBeInTheDocument()
  })

  it('shows best score badge when quiz has been attempted', () => {
    renderPage({
      quizzes: [mockQuiz],
      getBestScore: vi.fn().mockReturnValue(80),
    })
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('shows question count on the card', () => {
    renderPage({ quizzes: [mockQuiz] })
    expect(
      screen.getByText(`${mockQuiz.questions.length} questions`),
    ).toBeInTheDocument()
  })

  it('shows "Start" CTA when quiz has not been attempted', () => {
    renderPage({
      quizzes: [mockQuiz],
      getBestScore: vi.fn().mockReturnValue(null),
    })
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  it('shows "Retake" CTA when quiz has been attempted', () => {
    renderPage({
      quizzes: [mockQuiz],
      getBestScore: vi.fn().mockReturnValue(60),
      getQuizAttempts: vi.fn().mockReturnValue([{}]),
    })
    expect(screen.getByText('Retake')).toBeInTheDocument()
  })

  it('does NOT call fetchQuizzes when quizzes are already in context', () => {
    renderPage({ quizzes: [mockQuiz] })
    expect(quizDataModule.fetchQuizzes).not.toHaveBeenCalled()
  })

  it('calls fetchQuizzes when context quizzes are empty', async () => {
    vi.mocked(quizDataModule.fetchQuizzes).mockResolvedValue([mockQuiz])
    renderPage({ quizzes: [] })
    await waitFor(() => {
      expect(quizDataModule.fetchQuizzes).toHaveBeenCalledOnce()
    })
  })
})
