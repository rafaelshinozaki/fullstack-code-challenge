import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="text-8xl font-black text-primary-200">404</span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-text">Page not found</h1>
        <p className="text-text-muted">The page you're looking for doesn't exist.</p>
      </div>
      <Link
        to="/"
        className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        Back to Home
      </Link>
    </main>
  )
}
