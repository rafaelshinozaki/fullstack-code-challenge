export interface QuizQuestion {
  id: number
  question: string
  options: [string, string, string, string] | string[]
  correctAnswer: number
  explanation: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
}

export interface QuizAnswer {
  questionId: number
  selectedAnswer: number
  isCorrect: boolean
}

export interface QuizAttempt {
  id: string
  quizId: string
  quizTitle: string
  userId: string
  answers: QuizAnswer[]
  score: number
  totalQuestions: number
  percentage: number
  createdAt: string
}

export interface UserProfile {
  id: string
  username: string
  createdAt: string
  updatedAt: string
}
