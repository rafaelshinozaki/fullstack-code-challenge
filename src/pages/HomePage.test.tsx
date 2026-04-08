import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from './HomePage'

const useAppMock = vi.fn()

vi.mock('../context/AppContext', () => ({
  useApp: () => useAppMock(),
}))

describe('HomePage', () => {
  beforeEach(() => {
    useAppMock.mockReset()
  })

  it('renders hero and ctas', () => {
    useAppMock.mockReturnValue({
      user: null,
      attempts: [],
    })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /Master agent design, prompt engineering, and model choices/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Start learning/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open dashboard/i })).toBeInTheDocument()
  })

  it('shows stats section when attempts exist', () => {
    useAppMock.mockReturnValue({
      user: { id: 'u1', username: 'Raf', createdAt: '', updatedAt: '' },
      attempts: [
        {
          id: 'a1',
          quizId: 'agent-fundamentals',
          quizTitle: 'Agent Fundamentals',
          userId: 'u1',
          answers: [],
          score: 4,
          totalQuestions: 5,
          percentage: 80,
          createdAt: '',
        },
      ],
    })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Total Attempts/i)).toBeInTheDocument()
    expect(screen.getByText(/Quizzes Completed/i)).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })
})
