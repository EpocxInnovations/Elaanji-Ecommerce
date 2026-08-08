import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const user = await login(form)
      const redirectTo = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/account')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to sign in. Please check your details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-3xl mb-2">Sign In</h1>
      <p className="text-stone text-sm mb-8">Welcome back to Elaanji.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs tracking-widest2 uppercase text-stone mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border border-stone/30 px-4 py-3 bg-transparent focus:border-ink transition-colors"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs tracking-widest2 uppercase text-stone mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full border border-stone/30 px-4 py-3 bg-transparent focus:border-ink transition-colors"
          />
        </div>

        {error && <p className="text-sm text-oxblood">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-50">
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="text-sm text-stone mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-ink underline underline-offset-4">
          Create one
        </Link>
      </p>
    </div>
  )
}
