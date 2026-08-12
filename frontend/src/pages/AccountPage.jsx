import { Link, useNavigate } from 'react-router-dom'
import { Package, Heart, MapPin, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const QUICK_LINKS = [
  { label: 'My Orders', description: 'Track and manage your orders', to: '/orders', icon: Package },
  { label: 'Wishlist', description: 'Sarees you\'ve saved for later', to: '/wishlist', icon: Heart },
]

export function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 md:py-16">
      {/* Header */}
      <div className="mb-8">
        <p className="label-eyebrow mb-2">Account</p>
        <h1 className="font-display text-3xl">Welcome, {user.name?.split(' ')[0]}</h1>
      </div>

      {/* User Info Card */}
      <div className="border border-stone/15 p-5 sm:p-6 mb-6">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] tracking-widest2 uppercase text-stone mb-0.5">Name</p>
            <p className="text-sm">{user.name}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest2 uppercase text-stone mb-0.5">Email</p>
            <p className="text-sm">{user.email}</p>
          </div>
          {user.phone && (
            <div>
              <p className="text-[10px] tracking-widest2 uppercase text-stone mb-0.5">Phone</p>
              <p className="text-sm">{user.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-2 mb-8">
        {QUICK_LINKS.map(({ label, description, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 border border-stone/15 p-4 hover:border-ink/40 transition-colors group"
          >
            <div className="w-10 h-10 bg-beige/60 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-stone" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium group-hover:text-oxblood transition-colors">{label}</p>
              <p className="text-xs text-stone mt-0.5">{description}</p>
            </div>
            <ChevronRight size={16} className="text-stone group-hover:text-ink transition-colors" />
          </Link>
        ))}
      </div>

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-stone hover:text-oxblood transition-colors"
      >
        <LogOut size={16} strokeWidth={1.5} />
        Sign Out
      </button>
    </div>
  )
}
