import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { HomePage } from '../pages/HomePage'
import { ProfilePage } from '../pages/ProfilePage'
import { QuizPage } from '../pages/QuizPage'
import { QuizzesPage } from '../pages/QuizzesPage'
import { ResultsPage } from '../pages/ResultsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="quiz/:id" element={<QuizPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="results/:id" element={<ResultsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
