import type { QuizCategory } from '@/types'

export interface CategoryMeta {
  emoji: string
  label: string
  /** Tailwind text colour class */
  color: string
  /** Tailwind bg colour class */
  bg: string
  /** Tailwind border colour class */
  border: string
  /** Tailwind hover border colour class */
  hoverBorder: string
  /** Tailwind ring colour class used for card focus / hover glow */
  ring: string
}

export const CATEGORY_META: Record<QuizCategory, CategoryMeta> = {
  'agent-fundamentals': {
    emoji: '🤖',
    label: 'Agent Fundamentals',
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    hoverBorder: 'hover:border-primary-400',
    ring: 'ring-primary-300',
  },
  'prompt-engineering': {
    emoji: '✍️',
    label: 'Prompt Engineering',
    color: 'text-warning-700',
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    hoverBorder: 'hover:border-warning-400',
    ring: 'ring-warning-300',
  },
  'model-selection': {
    emoji: '🧠',
    label: 'Model Selection',
    color: 'text-success-700',
    bg: 'bg-success-50',
    border: 'border-success-200',
    hoverBorder: 'hover:border-success-400',
    ring: 'ring-success-300',
  },
}

/** Fallback for any future category not yet in the map */
export const DEFAULT_CATEGORY_META: CategoryMeta = {
  emoji: '📚',
  label: 'Quiz',
  color: 'text-primary-600',
  bg: 'bg-primary-50',
  border: 'border-primary-200',
  hoverBorder: 'hover:border-primary-400',
  ring: 'ring-primary-300',
}

export function getCategoryMeta(category: QuizCategory): CategoryMeta {
  return CATEGORY_META[category] ?? DEFAULT_CATEGORY_META
}
