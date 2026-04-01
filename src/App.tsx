import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import QuizSelect from '@/pages/QuizSelect'
import QuizPage from '@/pages/Quiz'
import ResultsPage from '@/pages/Results'
import Dashboard from '@/pages/Dashboard'
import ProfilePage from '@/pages/Profile'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* All pages share the same Layout (navbar + footer) */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="quizzes" element={<QuizSelect />} />
        <Route path="quiz/:quizId" element={<QuizPage />} />
        <Route path="results/:attemptId" element={<ResultsPage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 — outside Layout so it can fill the full screen */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
