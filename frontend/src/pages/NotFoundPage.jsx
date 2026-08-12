import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-32 text-center">
      <p className="font-display text-8xl text-stone/20 leading-none mb-4">404</p>
      <h1 className="font-display text-2xl mb-3">Page Not Found</h1>
      <p className="text-stone text-sm mb-8 max-w-xs mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary">
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to Home
      </Link>
    </div>
  )
}
