import { beforeEach, describe, expect, it } from 'vitest'
import type { QuizAttempt, UserProfile } from '../types'
import {
  clearAllData,
  clearAttempts,
  getAttempts,
  getUser,
  saveAttempt,
  setAttempts,
  setUser,
} from './storage'

function makeUser(): UserProfile {
  return {
    id: 'user-1',
    username: 'Rafael',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function makeAttempt(id: string, percentage: number): QuizAttempt {
  return {
    id,
    quizId: 'agent-fundamentals',
    quizTitle: 'Agent Fundamentals',
    userId: 'user-1',
    answers: [
      { questionId: 1, selectedAnswer: 1, isCorrect: true },
      { questionId: 2, selectedAnswer: 0, isCorrect: false },
    ],
    score: 1,
    totalQuestions: 2,
    percentage,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('storage utils', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('stores and retrieves user profile', () => {
    const user = makeUser()
    setUser(user)

    expect(getUser()).toEqual(user)
  })

  it('returns null for invalid user payload', () => {
    window.localStorage.setItem('quizapp:user', '{"bad":"shape"}')
    expect(getUser()).toBeNull()
  })

  it('saves attempts by appending and retrieves them', () => {
    const first = makeAttempt('a1', 50)
    const second = makeAttempt('a2', 80)

    saveAttempt(first)
    const result = saveAttempt(second)

    expect(result).toHaveLength(2)
    expect(getAttempts().map((item) => item.id)).toEqual(['a1', 'a2'])
  })

  it('setAttempts overwrites attempts and clearAttempts removes them', () => {
    const attempts = [makeAttempt('a1', 50), makeAttempt('a2', 70)]
    setAttempts(attempts)
    expect(getAttempts()).toEqual(attempts)

    clearAttempts()
    expect(getAttempts()).toEqual([])
  })

  it('returns empty list for invalid attempts payload', () => {
    window.localStorage.setItem('quizapp:attempts', '{"wrong":"value"}')
    expect(getAttempts()).toEqual([])
  })

  it('clearAllData clears user and attempts', () => {
    setUser(makeUser())
    setAttempts([makeAttempt('a1', 90)])

    clearAllData()

    expect(getUser()).toBeNull()
    expect(getAttempts()).toEqual([])
  })
})
