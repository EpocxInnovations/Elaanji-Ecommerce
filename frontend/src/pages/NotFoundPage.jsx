import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-6xl mb-4">404</h1>
      <p className="text-stone mb-8">This page doesn't exist.</p>
      <Link to="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  )
}
