import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await register(form)
      navigate('/account', { replace: true })
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to create your account. Please check your details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-3xl mb-2">Create Account</h1>
      <p className="text-stone text-sm mb-8">Join Elaanji for a personalized shopping experience.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-xs tracking-widest2 uppercase text-stone mb-2">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full border border-stone/30 px-4 py-3 bg-transparent focus:border-ink transition-colors"
          />
        </div>
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
          <label htmlFor="phone" className="block text-xs tracking-widest2 uppercase text-stone mb-2">
            Phone (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
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
            minLength={8}
            value={form.password}
            onChange={handleChange}
            className="w-full border border-stone/30 px-4 py-3 bg-transparent focus:border-ink transition-colors"
          />
          <p className="text-xs text-stone mt-1">At least 8 characters, with a letter and a number.</p>
        </div>

        {error && <p className="text-sm text-oxblood">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-50">
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-sm text-stone mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  )
}
