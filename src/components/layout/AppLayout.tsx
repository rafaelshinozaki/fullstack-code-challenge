import { Link, NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/quizzes', label: 'Quizzes' },
  { to: '/dashboard', label: 'Dashboard' },
] as const

function navClassName(isActive: boolean): string {
  return [
    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-100 text-primary-700'
      : 'text-text-muted hover:text-primary-700 hover:bg-primary-50',
  ].join(' ')
}

export function AppLayout() {
  const { user, isLoggedIn, login, logout } = useApp()
  const avatarLetter = user?.username?.trim()?.[0]?.toUpperCase() ?? 'G'

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <Link to="/" className="text-lg font-semibold text-primary-700">
              AI Dev Quiz
            </Link>
            <nav className="flex flex-wrap items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => navClassName(isActive)}
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {isLoggedIn && user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 hover:border-primary-300"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                    {avatarLetter}
                  </span>
                  <span className="text-sm font-medium text-text-base">{user.username}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:border-danger-300 hover:text-danger-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => login('Guest')}
                className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
              >
                Create profile
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-border/70 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-1 px-4 py-3 text-sm text-text-muted sm:h-14 sm:flex-row sm:items-center sm:gap-0 sm:py-0 sm:px-6">
          <p>AI Development Quiz App</p>
          <p>{new Date().getFullYear()} · Built with React + TypeScript</p>
        </div>
      </footer>
    </div>
  )
}
