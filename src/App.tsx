import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AppRoutes } from './router/AppRoutes'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
