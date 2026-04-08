import { describe, expect, it } from 'vitest'
import { fetchQuizById, fetchQuizzes } from './quizData'

describe('quizData api', () => {
  it('fetchQuizzes returns all quiz categories', async () => {
    const quizzes = await fetchQuizzes()

    expect(quizzes.length).toBeGreaterThanOrEqual(3)
    expect(quizzes.map((quiz) => quiz.id)).toEqual(
      expect.arrayContaining([
        'agent-fundamentals',
        'prompt-engineering',
        'model-selection',
      ]),
    )
  })

  it('fetchQuizById returns a specific quiz', async () => {
    const quiz = await fetchQuizById('agent-fundamentals')

    expect(quiz).not.toBeNull()
    expect(quiz?.title).toBe('Agent Fundamentals')
    expect(quiz?.questions).toHaveLength(5)
  })

  it('fetchQuizById returns null for unknown quiz id', async () => {
    const quiz = await fetchQuizById('unknown-id')
    expect(quiz).toBeNull()
  })

  it('returns cloned data to prevent external mutation', async () => {
    const firstRead = await fetchQuizzes()
    firstRead[0].title = 'Changed title'

    const secondRead = await fetchQuizzes()
    expect(secondRead[0].title).toBe('Agent Fundamentals')
  })
})
