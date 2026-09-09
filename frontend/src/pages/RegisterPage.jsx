import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Feather } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GoogleAuthButton } from '../components/GoogleAuthButton'

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-oxblood', 'bg-gold', 'bg-gold-light', 'bg-emerald-600']
  return { score, label: labels[score], color: colors[score] }
}

function BrandPanel({ title, subtitle }) {
  return (
    <div className="hidden lg:flex lg:w-[45%] bg-ink-gradient text-paper items-center justify-center p-12 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[140px] pointer-events-none" />
      <div className="absolute inset-y-0 left-10 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
      <div className="absolute inset-y-0 right-10 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

      {/* Watermark */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none select-none opacity-[0.04] text-paper">
        <p className="font-display text-[200px] leading-none">ए</p>
      </div>

      <div className="text-center max-w-md relative">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-gold/60" />
            <Feather size={16} className="text-gold-soft" />
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-gold/60" />
          </div>
          <h2 className="font-display text-5xl leading-tight mb-4 text-paper">{title}</h2>
          <p className="text-paper/60 text-[15px] leading-relaxed">
            {subtitle}
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-gold/60" />
            <span className="text-gold-soft">✦</span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-gold/60" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-2.5 sm:gap-4 my-6 w-full">
      <div className="flex-1 h-px bg-stone/15 min-w-[8px]" />
      <span className="text-[10px] sm:text-xs text-stone tracking-wider sm:tracking-widest2 uppercase text-center shrink-0">
        or continue with email
      </span>
      <div className="flex-1 h-px bg-stone/15 min-w-[8px]" />
    </div>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password])

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
    <div className="min-h-[calc(100vh-200px)] flex">
      <BrandPanel
        title="Join Elaanji"
        subtitle="Create your account for a personalised shopping experience: track orders, save favourites, and enjoy exclusive offers."
      />

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 bg-paper-gradient w-full overflow-hidden">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl sm:text-4xl mb-2">Create Account</h1>
          <p className="text-stone text-sm mb-7 sm:mb-8">Join ELAANJI for a personalized shopping experience.</p>

          <GoogleAuthButton onSuccess={() => navigate('/account', { replace: true })} />

          <Divider />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs tracking-wider sm:tracking-widest2 uppercase text-stone mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="input"
                autoComplete="name"
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
                className="input"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs tracking-widest2 uppercase text-stone mb-2">
                Phone <span className="normal-case text-stone/60">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="input"
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs tracking-widest2 uppercase text-stone mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  className="input !pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-gold transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
              {/* Password strength indicator */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 transition-colors duration-200 ${
                          level <= strength.score ? strength.color : 'bg-stone/15'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-stone">{strength.label}</p>
                </div>
              )}
              <p className="text-xs text-stone mt-1.5">At least 8 characters, with a letter and a number.</p>
            </div>

            {error && (
              <p className="text-sm text-oxblood bg-oxblood/5 px-3 py-2 border border-oxblood/20">{error}</p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-stone mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-ink underline underline-offset-4 hover:text-oxblood transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
