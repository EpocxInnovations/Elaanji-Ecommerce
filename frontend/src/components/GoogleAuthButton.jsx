import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

/**
 * Wraps @react-oauth/google's <GoogleLogin>. Renders nothing (and logs a
 * console warning once) if VITE_GOOGLE_CLIENT_ID isn't set, so local dev
 * without Google configured doesn't show a broken button.
 */
export function GoogleAuthButton({ onSuccess }) {
  const { loginWithGoogle } = useAuth()
  const { showToast } = useToast()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    return null
  }

  const handleSuccess = async (credentialResponse) => {
    try {
      const user = await loginWithGoogle(credentialResponse.credential)
      onSuccess?.(user)
    } catch (err) {
      showToast(err.response?.data?.detail || 'Google Sign-In failed. Please try again.', 'error')
    }
  }

  return (
    <div className="flex justify-center w-full max-w-full overflow-hidden">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => showToast('Google Sign-In failed. Please try again.', 'error')}
        theme="outline"
        shape="rectangular"
      />
    </div>
  )
}
