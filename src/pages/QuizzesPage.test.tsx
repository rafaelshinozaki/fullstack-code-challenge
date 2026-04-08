import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QuizzesPage } from './QuizzesPage'

const useAppMock = vi.fn()
const fetchQuizzesMock = vi.fn()

vi.mock('../context/AppContext', () => ({
  useApp: () => useAppMock(),
}))

vi.mock('../api/quizData', () => ({
  fetchQuizzes: () => fetchQuizzesMock(),
}))

describe('QuizzesPage', () => {
  beforeEach(() => {
    useAppMock.mockReset()
    fetchQuizzesMock.mockReset()
    useAppMock.mockReturnValue({
      getBestScore: (quizId: string) => (quizId === 'agent-fundamentals' ? 90 : null),
    })
  })

  it('renders loading state first', () => {
    fetchQuizzesMock.mockReturnValue(new Promise(() => {}))

    render(
      <MemoryRouter>
        <QuizzesPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Quiz Categories/i)).toBeInTheDocument()
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders quiz cards and best score', async () => {
    fetchQuizzesMock.mockResolvedValue([
      {
        id: 'agent-fundamentals',
        title: 'Agent Fundamentals',
        description: 'Core agent concepts',
        questions: [
          { id: 1, question: 'Q', options: ['A', 'B', 'C', 'D'], correctAnswer: 0, explanation: 'E' },
        ],
      },
    ])

    render(
      <MemoryRouter>
        <QuizzesPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Agent Fundamentals')).toBeInTheDocument()
    expect(screen.getByText(/Best score: 90%/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Start quiz/i })).toHaveAttribute(
      'href',
      '/quiz/agent-fundamentals',
    )
  })
})
