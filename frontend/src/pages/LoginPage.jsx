import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Feather } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GoogleAuthButton } from '../components/GoogleAuthButton'

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-lg border bg-transparent px-3 py-1 text-sm shadow-xs transition-all duration-300 outline-none disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const [rememberMe, setRememberMe] = useState(false)

  // 3D Card Interactive Rotation Effects
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const redirectAfterAuth = (user) => {
    const redirectTo = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/account')
    navigate(redirectTo, { replace: true })
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
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
    <div className="min-h-screen w-full bg-ink-deep text-paper relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6">
      {/* Background Gradient Effect - Luxury Elaanji Warm Gold & Oxblood Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-oxblood/35 via-ink/90 to-ink-deep" />

      {/* Subtle Noise Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Top & Bottom Radial Gold & Oxblood Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-gold/15 blur-[90px] pointer-events-none" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-gold-light/10 blur-[70px] pointer-events-none"
        animate={{
          opacity: [0.15, 0.35, 0.15],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'mirror',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-oxblood/20 blur-[80px] pointer-events-none"
        animate={{
          opacity: [0.25, 0.45, 0.25],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'mirror',
          delay: 1,
        }}
      />

      {/* Animated Glow Spots */}
      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[110px] animate-pulse opacity-40 pointer-events-none" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-oxblood-soft/15 rounded-full blur-[110px] animate-pulse delay-1000 opacity-40 pointer-events-none" />

      {/* Main 3D Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Card Outer Shadow Glow */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none"
              animate={{
                boxShadow: [
                  '0 0 15px 2px rgba(212, 168, 83, 0.08)',
                  '0 0 25px 6px rgba(212, 168, 83, 0.16)',
                  '0 0 15px 2px rgba(212, 168, 83, 0.08)',
                ],
                opacity: [0.25, 0.55, 0.25],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatType: 'mirror',
              }}
            />

            {/* Traveling Gold Light Beams */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
              {/* Top Light Beam */}
              <motion.div
                className="absolute top-0 left-0 h-[2.5px] w-[50%] bg-gradient-to-r from-transparent via-gold-soft to-transparent opacity-80"
                initial={{ filter: 'blur(1px)' }}
                animate={{
                  left: ['-50%', '100%'],
                  opacity: [0.3, 0.8, 0.3],
                  filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'],
                }}
                transition={{
                  left: { duration: 2.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 },
                  opacity: { duration: 1.4, repeat: Infinity, repeatType: 'mirror' },
                  filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror' },
                }}
              />

              {/* Right Light Beam */}
              <motion.div
                className="absolute top-0 right-0 h-[50%] w-[2.5px] bg-gradient-to-b from-transparent via-gold-soft to-transparent opacity-80"
                initial={{ filter: 'blur(1px)' }}
                animate={{
                  top: ['-50%', '100%'],
                  opacity: [0.3, 0.8, 0.3],
                  filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'],
                }}
                transition={{
                  top: { duration: 2.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 0.7 },
                  opacity: { duration: 1.4, repeat: Infinity, repeatType: 'mirror', delay: 0.7 },
                  filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 0.7 },
                }}
              />

              {/* Bottom Light Beam */}
              <motion.div
                className="absolute bottom-0 right-0 h-[2.5px] w-[50%] bg-gradient-to-r from-transparent via-gold-soft to-transparent opacity-80"
                initial={{ filter: 'blur(1px)' }}
                animate={{
                  right: ['-50%', '100%'],
                  opacity: [0.3, 0.8, 0.3],
                  filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'],
                }}
                transition={{
                  right: { duration: 2.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.4 },
                  opacity: { duration: 1.4, repeat: Infinity, repeatType: 'mirror', delay: 1.4 },
                  filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 1.4 },
                }}
              />

              {/* Left Light Beam */}
              <motion.div
                className="absolute bottom-0 left-0 h-[50%] w-[2.5px] bg-gradient-to-b from-transparent via-gold-soft to-transparent opacity-80"
                initial={{ filter: 'blur(1px)' }}
                animate={{
                  bottom: ['-50%', '100%'],
                  opacity: [0.3, 0.8, 0.3],
                  filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'],
                }}
                transition={{
                  bottom: { duration: 2.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 2.1 },
                  opacity: { duration: 1.4, repeat: Infinity, repeatType: 'mirror', delay: 2.1 },
                  filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 2.1 },
                }}
              />

              {/* Corner Glow Spots */}
              <motion.div
                className="absolute top-0 left-0 h-[6px] w-[6px] rounded-full bg-gold-light/60 blur-[1px]"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}
              />
              <motion.div
                className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-gold-soft/70 blur-[2px]"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatType: 'mirror', delay: 0.5 }}
              />
              <motion.div
                className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-gold-soft/70 blur-[2px]"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-[6px] w-[6px] rounded-full bg-gold-light/60 blur-[1px]"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.3, repeat: Infinity, repeatType: 'mirror', delay: 1.5 }}
              />
            </div>

            {/* Card Border Highlight */}
            <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-gold/20 via-gold-soft/30 to-gold/20 opacity-0 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

            {/* Glass Card Inner Content */}
            <div className="relative bg-ink/85 backdrop-blur-2xl rounded-2xl p-7 sm:p-9 border border-gold/15 shadow-luxury overflow-hidden">
              {/* Subtle Inner Pattern */}
              <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(135deg, #D4A853 0.5px, transparent 0.5px), linear-gradient(45deg, #D4A853 0.5px, transparent 0.5px)`,
                  backgroundSize: '28px 28px',
                }}
              />

              {/* Logo & Header */}
              <div className="text-center space-y-2 mb-7">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mx-auto w-16 h-16 rounded-full ring-2 ring-gold/40 shadow-gold-glow flex items-center justify-center relative overflow-hidden shrink-0"
                >
                  <img
                    src="/brand/logo-badge.png"
                    alt="Elaanji Brand Logo"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-display text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-paper via-paper-warm to-gold-soft"
                >
                  Welcome Back
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-stone-light text-xs sm:text-sm tracking-wide"
                >
                  Sign in to continue to ELAANJI
                </motion.p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div className="space-y-3.5">
                  {/* Email Input */}
                  <motion.div
                    className={`relative ${focusedInput === 'email' ? 'z-10' : ''}`}
                    whileFocus={{ scale: 1.01 }}
                    whileHover={{ scale: 1.005 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute -inset-[0.5px] bg-gradient-to-r from-gold/20 via-gold-soft/30 to-gold/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Mail
                        className={`absolute left-3.5 w-4 h-4 transition-colors duration-300 ${
                          focusedInput === 'email' ? 'text-gold-soft' : 'text-stone-light/60'
                        }`}
                      />

                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="Email address"
                        value={form.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        autoComplete="email"
                        className="w-full bg-paper/5 border-stone/20 focus:border-gold/50 text-paper placeholder:text-stone-light/40 h-11 transition-all duration-300 pl-10 pr-3.5 focus:bg-paper/10"
                      />

                      {focusedInput === 'email' && (
                        <motion.div
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-gold/5 -z-10 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Password Input */}
                  <motion.div
                    className={`relative ${focusedInput === 'password' ? 'z-10' : ''}`}
                    whileFocus={{ scale: 1.01 }}
                    whileHover={{ scale: 1.005 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute -inset-[0.5px] bg-gradient-to-r from-gold/20 via-gold-soft/30 to-gold/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock
                        className={`absolute left-3.5 w-4 h-4 transition-colors duration-300 ${
                          focusedInput === 'password' ? 'text-gold-soft' : 'text-stone-light/60'
                        }`}
                      />

                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        autoComplete="current-password"
                        className="w-full bg-paper/5 border-stone/20 focus:border-gold/50 text-paper placeholder:text-stone-light/40 h-11 transition-all duration-300 pl-10 pr-10 focus:bg-paper/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-stone-light/60 hover:text-gold-soft transition-colors duration-300 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      {focusedInput === 'password' && (
                        <motion.div
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-gold/5 -z-10 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="appearance-none h-4 w-4 rounded border border-gold/30 bg-paper/5 checked:bg-gold-soft checked:border-gold-soft focus:outline-none focus:ring-1 focus:ring-gold/40 transition-all duration-200 cursor-pointer"
                      />
                      {rememberMe && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center text-ink-deep pointer-events-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    <label
                      htmlFor="remember-me"
                      className="text-xs text-stone-light hover:text-paper transition-colors duration-200 cursor-pointer select-none"
                    >
                      Remember me
                    </label>
                  </div>

                  <Link
                    to="/forgot-password"
                    className="text-xs text-gold-soft hover:text-gold-light transition-colors duration-200 underline underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-oxblood-soft bg-oxblood/15 border border-oxblood/30 px-3.5 py-2.5 rounded-lg text-center"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Sign In Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative group/button mt-4 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gold/20 rounded-lg blur-md opacity-0 group-hover/button:opacity-80 transition-opacity duration-300" />

                  <div className="relative overflow-hidden bg-gold-gradient text-ink-deep font-semibold tracking-widest2 uppercase h-11 rounded-lg transition-all duration-300 flex items-center justify-center shadow-gold-glow">
                    {/* Button shimmer animation */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-paper/0 via-paper/40 to-paper/0 -z-10"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 1.8,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                      style={{
                        opacity: isSubmitting ? 1 : 0.6,
                      }}
                    />

                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <div className="w-4 h-4 border-2 border-ink-deep border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-semibold">Signing in…</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="button-text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2 text-xs font-semibold"
                        >
                          Sign In
                          <ArrowRight className="w-3.5 h-3.5 group-hover/button:translate-x-1 transition-transform duration-300" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {/* Minimal Divider */}
                <div className="relative mt-5 mb-5 flex items-center">
                  <div className="flex-grow border-t border-paper/10"></div>
                  <motion.span
                    className="mx-3 text-[11px] uppercase tracking-wider text-stone-light/60 font-medium"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: [0.7, 0.9, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    or continue with
                  </motion.span>
                  <div className="flex-grow border-t border-paper/10"></div>
                </div>

                {/* Google Sign In Component */}
                <div className="w-full flex justify-center">
                  <GoogleAuthButton onSuccess={redirectAfterAuth} />
                </div>

                {/* Sign Up Link */}
                <motion.p
                  className="text-center text-xs text-stone-light mt-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Don't have an account?{' '}
                  <Link to="/register" className="relative inline-block group/signup">
                    <span className="relative z-10 text-gold-soft group-hover/signup:text-gold-light transition-colors duration-300 font-medium">
                      Create one
                    </span>
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold-soft group-hover/signup:w-full transition-all duration-300" />
                  </Link>
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

