import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-3xl mb-8">My Account</h1>

      <div className="border border-stone/20 p-6 mb-6">
        <p className="label-eyebrow mb-1">Name</p>
        <p className="mb-4">{user.name}</p>
        <p className="label-eyebrow mb-1">Email</p>
        <p className="mb-4">{user.email}</p>
        {user.phone && (
          <>
            <p className="label-eyebrow mb-1">Phone</p>
            <p>{user.phone}</p>
          </>
        )}
      </div>

      <p className="text-stone text-sm mb-6">
        Order history, saved addresses, and wishlist sync land in Phase 2 and 3 of the build.
      </p>

      <button onClick={handleLogout} className="btn-secondary">
        Sign Out
      </button>
    </div>
  )
}
