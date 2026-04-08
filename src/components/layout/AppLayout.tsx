import { NavLink, Outlet, Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/quizzes', label: 'Quizzes' },
  { to: '/dashboard', label: 'Dashboard' },
] as const

function navClassName(isActive: boolean): string {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-primary text-white shadow-sm'
      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')
}

function getInitial(username: string): string {
  return username.trim().slice(0, 1).toUpperCase() || 'U'
}

export function AppLayout() {
  const { user } = useApp()

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            AI Quiz App
          </Link>

          <nav className="order-3 w-full overflow-x-auto sm:order-2 sm:w-auto">
            <div className="flex min-w-max items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                {({ isActive }) => (
                  <span className={navClassName(isActive)}>{item.label}</span>
                )}
              </NavLink>
            ))}
            </div>
          </nav>

          <div className="order-2 flex min-w-32 justify-end sm:order-3">
            {user ? (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {getInitial(user.username)}
                </span>
                <span className="max-w-24 truncate sm:max-w-none">{user.username}</span>
              </Link>
            ) : (
              <Link
                to="/profile"
                className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
              >
                Create profile
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-1 px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:px-6">
          <p>AI Development Quiz App</p>
          <p>Built with React + TypeScript + Tailwind</p>
        </div>
      </footer>
    </div>
  )
}
