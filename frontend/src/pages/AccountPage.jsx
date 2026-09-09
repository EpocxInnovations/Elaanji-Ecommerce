import { Link, useNavigate } from 'react-router-dom'
import { Package, Heart, MapPin, LogOut, ChevronRight, User, ShieldCheck, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const QUICK_LINKS = [
  { label: 'My Orders', description: 'Track and manage your orders', to: '/orders', icon: Package },
  { label: 'Wishlist', description: 'Sarees you\'ve saved for later', to: '/wishlist', icon: Heart },
]

export function AccountPage() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <p className="label-eyebrow mb-3 flex items-center gap-3">
          <span className="w-8 h-px bg-gold/60" />
          Account
        </p>
        <h1 className="font-display text-4xl md:text-5xl">Welcome, {user.name?.split(' ')[0]}</h1>
      </div>

      {/* User Info Card */}
      <div className="border border-gold/20 p-5 sm:p-7 mb-8 bg-paper/60 backdrop-blur-xl shadow-card">
        <div className="flex items-start gap-3 sm:gap-4 mb-5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gold-gradient text-ink-deep flex items-center justify-center shrink-0">
            <User size={18} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-base sm:text-lg leading-tight truncate">{user.name}</p>
            <p className="text-xs text-stone mt-0.5 truncate">{user.email}</p>
          </div>
        </div>
        <div className="border-t border-gold/10 pt-4 space-y-2.5">
          <div className="flex justify-between items-center text-sm gap-2">
            <span className="text-stone shrink-0">Name</span>
            <span className="font-medium truncate text-right">{user.name}</span>
          </div>
          <div className="flex justify-between items-center text-sm gap-2">
            <span className="text-stone shrink-0">Email</span>
            <span className="font-medium truncate text-right max-w-[200px] sm:max-w-none">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex justify-between items-center text-sm gap-2">
              <span className="text-stone shrink-0">Phone</span>
              <span className="font-medium truncate text-right">{user.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Privileges Banner */}
      {isAdmin && (
        <div className="border border-gold/40 p-5 sm:p-6 mb-8 bg-ink text-paper shadow-gold-glow relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 bg-gold-gradient text-ink-deep flex items-center justify-center shrink-0">
                <ShieldCheck size={20} strokeWidth={2} />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold font-bold">Admin Privileges Active</span>
                <p className="font-display text-lg text-paper mt-0.5">Admin Management Panel</p>
                <p className="text-xs text-stone-300 mt-1">Manage sarees, stock, orders, customer discounts, and analytics.</p>
              </div>
            </div>
            <Link
              to="/admin"
              className="btn-primary !bg-gold-gradient !text-ink-deep hover:!bg-oxblood hover:!text-paper text-xs uppercase tracking-wider font-semibold py-2.5 px-5 flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto shadow-md"
            >
              <span>Go to Admin Panel</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="space-y-2.5 mb-10">
        {[
          ...(isAdmin
            ? [
                {
                  label: 'Admin Panel & Dashboard',
                  description: 'Access backend controls, orders, products & sales reports',
                  to: '/admin',
                  icon: ShieldCheck,
                  highlight: true,
                },
              ]
            : []),
          ...QUICK_LINKS,
        ].map(({ label, description, to, icon: Icon, highlight }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-4 border p-5 transition-all group ${
              highlight
                ? 'border-gold/50 bg-gold/5 hover:border-gold hover:shadow-gold-glow'
                : 'border-stone/15 hover:border-gold/40 hover:shadow-card-hover'
            }`}
          >
            <div
              className={`w-11 h-11 flex items-center justify-center shrink-0 transition-colors duration-300 ${
                highlight
                  ? 'bg-gold-gradient text-ink-deep'
                  : 'bg-beige/60 text-stone group-hover:bg-gold-gradient group-hover:text-ink-deep'
              }`}
            >
              <Icon size={18} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium group-hover:text-oxblood transition-colors">{label}</p>
                {highlight && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-ink text-gold uppercase tracking-wider font-semibold">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-stone mt-0.5">{description}</p>
            </div>
            <ChevronRight
              size={16}
              className={`transition-all ${
                highlight ? 'text-gold group-hover:translate-x-1.5' : 'text-stone group-hover:text-gold group-hover:translate-x-1'
              }`}
            />
          </Link>
        ))}
      </div>

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-stone hover:text-oxblood transition-colors cursor-pointer"
      >
        <LogOut size={16} strokeWidth={1.5} />
        Sign Out
      </button>
    </div>
  )
}
