import { describe, it, expect, vi } from 'vitest'
import {
  getUser,
  setUser,
  getAttempts,
  getAttemptsByQuiz,
  saveAttempt,
  clearAllData,
} from '@/utils/storage'
import { mockProfile, mockAttempt } from '@/test/fixtures'

// localStorage is cleared before each test by src/test/setup.ts

describe('getUser', () => {
  it('returns null when localStorage is empty', () => {
    expect(getUser()).toBeNull()
  })

  it('returns the profile after setUser', () => {
    setUser(mockProfile)
    expect(getUser()).toEqual(mockProfile)
  })

  it('returns null when localStorage contains malformed JSON', () => {
    localStorage.setItem('qza:user', '{ not valid json }}}')
    expect(getUser()).toBeNull()
  })
})

describe('setUser', () => {
  it('writes the profile under the correct storage key', () => {
    setUser(mockProfile)
    const raw = localStorage.getItem('qza:user')
    expect(raw).not.toBeNull()
    const stored = JSON.parse(raw!)
    expect(stored.profile).toEqual(mockProfile)
  })

  it('initialises an empty attempts array when none exist', () => {
    setUser(mockProfile)
    const raw = JSON.parse(localStorage.getItem('qza:user')!)
    expect(raw.attempts).toEqual([])
  })

  it('preserves existing attempts when updating the profile', () => {
    setUser(mockProfile)
    saveAttempt(mockAttempt)

    const updatedProfile = { ...mockProfile, username: 'renamed' }
    setUser(updatedProfile)

    expect(getUser()?.username).toBe('renamed')
    expect(getAttempts()).toHaveLength(1)
  })
})

describe('getAttempts', () => {
  it('returns an empty array when no profile or attempts exist', () => {
    expect(getAttempts()).toEqual([])
  })

  it('returns an empty array when profile exists but has no attempts', () => {
    setUser(mockProfile)
    expect(getAttempts()).toEqual([])
  })

  it('returns attempts sorted newest-first by completedAt', () => {
    setUser(mockProfile)

    const older = { ...mockAttempt, id: 'old', completedAt: '2025-01-01T00:00:00.000Z' }
    const newer = { ...mockAttempt, id: 'new', completedAt: '2025-01-03T00:00:00.000Z' }
    const middle = { ...mockAttempt, id: 'mid', completedAt: '2025-01-02T00:00:00.000Z' }

    saveAttempt(older)
    saveAttempt(middle)
    saveAttempt(newer)

    const result = getAttempts()
    expect(result[0].id).toBe('new')
    expect(result[1].id).toBe('mid')
    expect(result[2].id).toBe('old')
  })
})

describe('getAttemptsByQuiz', () => {
  it('returns only attempts matching the given quizId', () => {
    setUser(mockProfile)

    const other = { ...mockAttempt, id: 'other', quizId: 'other-quiz' }
    saveAttempt(mockAttempt)
    saveAttempt(other)

    const result = getAttemptsByQuiz('test-quiz')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(mockAttempt.id)
  })

  it('returns empty array when no attempts match', () => {
    setUser(mockProfile)
    expect(getAttemptsByQuiz('nonexistent-quiz')).toEqual([])
  })
})

describe('saveAttempt', () => {
  it('is a no-op and logs a warning when no profile exists', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    saveAttempt(mockAttempt)
    expect(warn).toHaveBeenCalledOnce()
    expect(getAttempts()).toEqual([])
    warn.mockRestore()
  })

  it('stores the attempt when a profile exists', () => {
    setUser(mockProfile)
    saveAttempt(mockAttempt)
    expect(getAttempts()).toHaveLength(1)
    expect(getAttempts()[0]).toEqual(mockAttempt)
  })

  it('accumulates multiple attempts', () => {
    setUser(mockProfile)
    const a1 = { ...mockAttempt, id: 'a1', completedAt: '2025-01-01T00:00:00.000Z' }
    const a2 = { ...mockAttempt, id: 'a2', completedAt: '2025-01-02T00:00:00.000Z' }
    saveAttempt(a1)
    saveAttempt(a2)
    expect(getAttempts()).toHaveLength(2)
  })
})

describe('clearAllData', () => {
  it('removes the storage key entirely', () => {
    setUser(mockProfile)
    saveAttempt(mockAttempt)

    clearAllData()

    expect(localStorage.getItem('qza:user')).toBeNull()
    expect(getUser()).toBeNull()
    expect(getAttempts()).toEqual([])
  })
})
