import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GoogleAuthButton } from '../components/GoogleAuthButton'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const redirectAfterAuth = (user) => {
    const redirectTo = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/account')
    navigate(redirectTo, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const user = await login(form)
      redirectAfterAuth(user)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to sign in. Please check your details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-beige items-center justify-center p-12">
        <div className="text-center max-w-sm">
          <div className="mb-8">
            <div className="w-px h-16 bg-stone/30 mx-auto mb-6" />
            <h2 className="font-display text-4xl leading-tight mb-3">Welcome Back</h2>
            <p className="text-stone text-sm leading-relaxed">
              Sign in to your Elaanji account to track orders, save your favourites, and enjoy a personalised shopping experience.
            </p>
            <div className="w-px h-16 bg-stone/30 mx-auto mt-6" />
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl mb-2">Sign In</h1>
          <p className="text-stone text-sm mb-8">Welcome back to ELAANJI.</p>

          <GoogleAuthButton onSuccess={redirectAfterAuth} />

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-stone/15" />
            <span className="text-xs text-stone tracking-widest2 uppercase">or</span>
            <div className="flex-1 h-px bg-stone/15" />
          </div>

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
                className="input"
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs tracking-widest2 uppercase text-stone">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-oxblood hover:text-ink transition-colors underline underline-offset-4">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="input !pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-oxblood bg-oxblood/5 px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-stone mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-ink underline underline-offset-4 hover:text-oxblood transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}