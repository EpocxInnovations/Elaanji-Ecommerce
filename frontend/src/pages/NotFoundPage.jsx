import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-32 text-center relative">
      <p className="font-display text-9xl text-gold-gradient leading-none mb-6">404</p>
      <h1 className="font-display text-3xl mb-3">Page Not Found</h1>
      <p className="text-stone text-sm mb-10 max-w-xs mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary">
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to Home
      </Link>
    </div>
  )
}
