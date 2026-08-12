import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { authApi } from '../api/auth'
import { useToast } from '../context/ToastContext'

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

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Steps: 'email' | 'otp' | 'password' | 'success'
  const [step, setStep] = useState('email')

  // Form states
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI & loading states
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Resend cooldown timer (60 seconds)
  const [cooldown, setCooldown] = useState(0)

  // Refs for 6-digit OTP inputs
  const otpInputRefs = useRef([])

  // Password strength calculation
  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword])

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Auto-focus first OTP input when moving to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 100)
    }
  }, [step])

  // ----------------------------------------------------
  // STEP 1: Send OTP
  // ----------------------------------------------------
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try:
      const res = await authApi.forgotPassword({ email: email.trim() })
      setStep('otp')
      setCooldown(60)
      if (res?.dev_otp) {
        showToast(`Demo/Dev OTP Code: ${res.dev_otp}`, { duration: 10000 })
      } else {
        showToast('A 6-digit verification code has been sent to your email.')
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response?.data?.detail || 'Please wait before requesting another code.')
      } else {
        setError(err.response?.data?.detail || 'Unable to process your request. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return
    setError('')
    setIsSubmitting(true)
    try {
      const res = await authApi.forgotPassword({ email: email.trim() })
      setOtpDigits(['', '', '', '', '', ''])
      setCooldown(60)
      if (res?.dev_otp) {
        showToast(`Demo/Dev OTP Code: ${res.dev_otp}`, { duration: 10000 })
      } else {
        showToast('A new 6-digit code has been sent to your email.')
      }
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100)
    } catch (err) {

      if (err.response?.status === 429) {
        setError(err.response?.data?.detail || 'Please wait before requesting another code.')
      } else {
        setError(err.response?.data?.detail || 'Could not resend verification code.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ----------------------------------------------------
  // STEP 2: OTP Digit Handlers
  // ----------------------------------------------------
  const handleOtpChange = (index, value) => {
    // Only accept numeric characters
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otpDigits]
    newOtp[index] = value.slice(-1) // Take last character entered
    setOtpDigits(newOtp)

    // Auto advance to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setOtpDigits(digits)
      otpInputRefs.current[5]?.focus()
    }
  }

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    setError('')
    const fullOtp = otpDigits.join('')
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authApi.verifyResetOtp({ email: email.trim(), otp: fullOtp })
      setResetToken(res.reset_token)
      setStep('password')
      showToast('Verification code confirmed successfully.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired verification code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ----------------------------------------------------
  // STEP 3: Reset Password
  // ----------------------------------------------------
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
      setError('Password must contain at least one letter and one number.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.resetPassword({ reset_token: resetToken, new_password: newPassword })
      setStep('success')
      showToast('Your password has been updated successfully.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not reset your password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex">
      {/* Editorial Side Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-beige items-center justify-center p-12">
        <div className="text-center max-w-sm">
          <div className="mb-8">
            <div className="w-px h-16 bg-stone/30 mx-auto mb-6" />
            <h2 className="font-display text-4xl leading-tight mb-3">Account Security</h2>
            <p className="text-stone text-sm leading-relaxed">
              Resetting your password is fast and secure. We verify your identity using a 6-digit code delivered directly to your registered email.
            </p>
            <div className="w-px h-16 bg-stone/30 mx-auto mt-6" />
          </div>
        </div>
      </div>

      {/* Main Form Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="w-full max-w-sm">
          {/* STEP 1: Enter Email */}
          {step === 'email' && (
            <div>
              <h1 className="font-display text-3xl mb-2">Forgot Password?</h1>
              <p className="text-stone text-sm mb-8">
                Enter your registered email address and we'll send you a 6-digit verification code.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label htmlFor="reset-email" className="block text-xs tracking-widest2 uppercase text-stone mb-2">
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <p className="text-sm text-oxblood bg-oxblood/5 px-3 py-2 border border-oxblood/20">{error}</p>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? 'Sending Code…' : 'Send Verification Code'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-stone/15 text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-stone hover:text-ink transition-colors">
                  <ArrowLeft size={16} strokeWidth={1.5} />
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 'otp' && (
            <div>
              <h1 className="font-display text-3xl mb-2">Enter 6-Digit Code</h1>
              <p className="text-stone text-sm mb-2">
                We've sent a 6-digit verification code to:
              </p>
              <p className="text-sm font-medium text-ink mb-6 truncate">{email}</p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-xs tracking-widest2 uppercase text-stone mb-3">
                    Verification Code
                  </label>
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        aria-label={`Digit ${index + 1} of verification code`}
                        className="w-11 h-13 text-center font-mono text-xl font-medium border border-stone/30 bg-transparent
                                   focus:border-ink focus:outline-none transition-colors"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-oxblood bg-oxblood/5 px-3 py-2 border border-oxblood/20">{error}</p>
                )}

                <button type="submit" disabled={isSubmitting || otpDigits.join('').length !== 6} className="btn-primary w-full">
                  {isSubmitting ? 'Verifying…' : 'Verify Code'}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || isSubmitting}
                  className={`font-medium transition-colors ${
                    cooldown > 0 || isSubmitting
                      ? 'text-stone/50 cursor-not-allowed'
                      : 'text-oxblood hover:text-ink underline underline-offset-4'
                  }`}
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setError('')
                  }}
                  className="text-stone hover:text-ink transition-colors"
                >
                  Change Email
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-stone/15 text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-stone hover:text-ink transition-colors">
                  <ArrowLeft size={16} strokeWidth={1.5} />
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 'password' && (
            <div>
              <h1 className="font-display text-3xl mb-2">Set New Password</h1>
              <p className="text-stone text-sm mb-8">
                Please create a strong new password for your account.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label htmlFor="new-password" className="block text-xs tracking-widest2 uppercase text-stone mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input !pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                    </button>
                  </div>

                  {/* Strength Bar */}
                  {newPassword && (
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

                <div>
                  <label htmlFor="confirm-password" className="block text-xs tracking-widest2 uppercase text-stone mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input !pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-oxblood bg-oxblood/5 px-3 py-2 border border-oxblood/20">{error}</p>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? 'Resetting Password…' : 'Reset Password'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: Success State */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-6 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-full border border-emerald-200">
                <CheckCircle2 size={32} strokeWidth={1.5} />
              </div>
              <h1 className="font-display text-3xl mb-3">Password Reset Successfully</h1>
              <p className="text-stone text-sm leading-relaxed mb-8">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="btn-primary w-full"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
