import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-8">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white/85 p-8 text-center shadow-sm backdrop-blur-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-warning">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-3 text-slate-600">
          The page you are trying to access does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
        >
          Return to home
        </Link>
      </section>
    </main>
  )
}
