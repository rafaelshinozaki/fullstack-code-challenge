import type { FeedbackLabel } from '@/types'

/**
 * Returns a 0–100 integer score for a quiz attempt.
 */
export function calculateScore(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0
  return Math.round((correctAnswers / totalQuestions) * 100)
}

/**
 * Maps a percentage score to a human-readable feedback label.
 *
 * ≥ 80  → Excellent
 * ≥ 60  → Good job!
 * ≥ 40  → Keep practicing
 *  < 40 → Needs review
 */
export function getFeedbackLabel(score: number): FeedbackLabel {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good job!'
  if (score >= 40) return 'Keep practicing'
  return 'Needs review'
}

/**
 * Returns Tailwind colour classes for the feedback label.
 */
export function getFeedbackClasses(label: FeedbackLabel): { bg: string; text: string; border: string } {
  switch (label) {
    case 'Excellent':
      return { bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-200' }
    case 'Good job!':
      return { bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200' }
    case 'Keep practicing':
      return { bg: 'bg-warning-50', text: 'text-warning-700', border: 'border-warning-200' }
    case 'Needs review':
      return { bg: 'bg-danger-50', text: 'text-danger-700', border: 'border-danger-200' }
  }
}
