import { describe, it, expect } from 'vitest'
import { fetchQuizzes, fetchQuizById } from '@/api/quizData'

describe('fetchQuizzes', () => {
  it('returns an array of quizzes', async () => {
    const quizzes = await fetchQuizzes()
    expect(Array.isArray(quizzes)).toBe(true)
    expect(quizzes.length).toBeGreaterThan(0)
  })

  it('returns all three quiz categories', async () => {
    const quizzes = await fetchQuizzes()
    const ids = quizzes.map((q) => q.id)
    expect(ids).toContain('agent-fundamentals')
    expect(ids).toContain('prompt-engineering')
    expect(ids).toContain('model-selection')
  })

  it('every quiz has at least 5 questions', async () => {
    const quizzes = await fetchQuizzes()
    for (const quiz of quizzes) {
      expect(quiz.questions.length).toBeGreaterThanOrEqual(5)
    }
  })

  it('every question has a valid correctAnswer index', async () => {
    const quizzes = await fetchQuizzes()
    for (const quiz of quizzes) {
      for (const q of quiz.questions) {
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(q.correctAnswer).toBeLessThan(q.options.length)
      }
    }
  })

  it('every question has an explanation', async () => {
    const quizzes = await fetchQuizzes()
    for (const quiz of quizzes) {
      for (const q of quiz.questions) {
        expect(q.explanation.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('fetchQuizById', () => {
  it('returns the correct quiz when the id exists', async () => {
    const quiz = await fetchQuizById('agent-fundamentals')
    expect(quiz).not.toBeNull()
    expect(quiz?.id).toBe('agent-fundamentals')
    expect(quiz?.title).toBe('Agent Fundamentals')
  })

  it('returns null for an unknown id', async () => {
    const quiz = await fetchQuizById('does-not-exist')
    expect(quiz).toBeNull()
  })

  it('returns the quiz with correctly structured questions', async () => {
    const quiz = await fetchQuizById('prompt-engineering')
    expect(quiz).not.toBeNull()
    const q = quiz!.questions[0]
    expect(q).toHaveProperty('id')
    expect(q).toHaveProperty('question')
    expect(q).toHaveProperty('options')
    expect(q).toHaveProperty('correctAnswer')
    expect(q).toHaveProperty('explanation')
  })

  it('returns null for an empty string id', async () => {
    const quiz = await fetchQuizById('')
    expect(quiz).toBeNull()
  })
})
