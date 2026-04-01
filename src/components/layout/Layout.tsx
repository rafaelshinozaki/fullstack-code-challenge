import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom'
import { useApp } from '@/context/AppContext'

// ─── Logo ──────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5 focus-visible:outline-none"
      aria-label="AI Dev Quiz — home"
    >
      {/* Icon mark */}
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-black text-white shadow-sm transition group-hover:bg-primary-700"
      >
        AI
      </span>
      <span className="text-base font-bold tracking-tight text-text">
        AI Dev{' '}
        <span className="text-primary-600">Quiz</span>
      </span>
    </Link>
  )
}

// ─── Nav links ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/quizzes', label: 'Quizzes', end: false },
  { to: '/dashboard', label: 'Dashboard', end: false },
] as const

function NavLinks({ onClose }: { onClose?: () => void }) {
  return (
    <>
      {NAV_LINKS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onClose}
          className={({ isActive }) =>
            [
              'relative px-1 py-0.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded',
              isActive
                ? 'text-primary-600 after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-primary-600'
                : 'text-text-muted hover:text-text',
            ].join(' ')
          }
        >
          {label}
        </NavLink>
      ))}
    </>
  )
}

// ─── User area ─────────────────────────────────────────────────────────────────

function UserArea() {
  const { profile, logout } = useApp()
  const navigate = useNavigate()

  if (!profile) {
    return (
      <Link
        to="/profile"
        className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        Get Started
      </Link>
    )
  }

  const initial = profile.username.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-3">
      {/* Avatar + name — link to profile page */}
      <Link
        to="/profile"
        className="group flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        aria-label={`${profile.username}'s profile`}
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 ring-2 ring-white transition group-hover:bg-primary-200"
        >
          {initial}
        </span>
        <span className="hidden text-sm font-medium text-text transition group-hover:text-primary-600 sm:block">
          {profile.username}
        </span>
      </Link>

      {/* Sign out */}
      <button
        onClick={() => {
          logout()
          navigate('/')
        }}
        className="rounded px-2 py-1 text-xs font-medium text-text-muted transition hover:text-danger-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label="Sign out"
      >
        Sign out
      </button>
    </div>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-surface/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-6 px-4 sm:px-6"
        aria-label="Main navigation"
      >
        {/* Left: logo */}
        <Logo />

        {/* Centre: nav links (hidden on small screens — could add a hamburger later) */}
        <div className="hidden items-center gap-6 sm:flex">
          <NavLinks />
        </div>

        {/* Right: user area */}
        <UserArea />
      </nav>

      {/* Mobile nav row */}
      <div className="flex items-center gap-5 border-t border-border/40 px-4 py-2.5 sm:hidden">
        <NavLinks />
      </div>
    </header>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-surface/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <p className="text-xs text-text-subtle">
          &copy; {new Date().getFullYear()} AI Dev Quiz. Built to sharpen your AI knowledge.
        </p>
        <p className="text-xs text-text-subtle">
          Powered by{' '}
          <span className="font-semibold text-primary-500">React&nbsp;+&nbsp;TypeScript</span>
        </p>
      </div>
    </footer>
  )
}

// ─── Layout ────────────────────────────────────────────────────────────────────

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      {/* Page content rendered by the router outlet */}
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
