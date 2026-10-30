import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Undo2,
  Package,
  FolderTree,
  Boxes,
  Users,
  CreditCard,
  Tag,
  Star,
  Image,
  BarChart3,
  Settings,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Returns', to: '/admin/returns', icon: Undo2 },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Categories', to: '/admin/categories', icon: FolderTree },
  { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Payments', to: '/admin/payments', icon: CreditCard },
  { label: 'Coupons', to: '/admin/coupons', icon: Tag },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
  { label: 'Banners', to: '/admin/banners', icon: Image },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

function SidebarLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map(({ label, to, icon: Icon, end }) => (
        <NavLink
          key={label}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
              isActive ? 'bg-ink-gradient text-paper shadow-card font-medium' : 'text-ink/75 hover:bg-beige/60 hover:text-ink'
            }`
          }
        >
          <Icon size={18} className="shrink-0" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}

      <div className="pt-4 mt-2 border-t border-stone/15">
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-gold hover:text-oxblood hover:bg-gold/5 transition-colors font-medium"
        >
          <span className="flex items-center gap-2">
            <ExternalLink size={14} />
            View Live Store
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gold/10 text-gold-dark">
            Live
          </span>
        </Link>
      </div>
    </nav>
  )
}

export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-stone/20 bg-paper h-screen sticky top-0 py-6 overflow-y-auto no-scrollbar">
        <div className="px-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/brand/logo-badge.png"
              alt="Elaanji Admin"
              className="w-9 h-9 rounded-full object-cover ring-1 ring-gold/40 shadow-sm shrink-0"
            />
            <div>
              <span className="font-display text-xl tracking-wider text-ink block leading-none">ELAANJI</span>
              <p className="text-[10px] text-stone tracking-widest2 uppercase mt-1 font-semibold">Admin Panel</p>
            </div>
          </div>
        </div>
        <SidebarLinks />
      </aside>

      {/* Mobile top navigation bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-stone/20 bg-paper/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
            className="p-1.5 -ml-1 text-ink hover:bg-stone/10 rounded-md transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/brand/logo-badge.png"
              alt="Elaanji Admin"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-gold/40 shrink-0"
            />
            <div>
              <span className="font-display text-lg tracking-wide text-ink">ELAANJI</span>
              <span className="text-[10px] text-gold font-mono uppercase ml-2 tracking-wider">Admin</span>
            </div>
          </div>
        </div>

        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-stone hover:text-ink inline-flex items-center gap-1 px-2.5 py-1 rounded border border-stone/20 hover:border-stone/40 transition-colors"
        >
          <span>Store</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Mobile drawer with backdrop blur */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-paper h-full py-6 overflow-y-auto z-10 shadow-2xl no-scrollbar flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between px-6 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/brand/logo-badge.png"
                    alt="Elaanji Admin"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-gold/40 shadow-sm shrink-0"
                  />
                  <div>
                    <span className="font-display text-xl tracking-wider text-ink block leading-none">ELAANJI</span>
                    <p className="text-[10px] text-stone tracking-widest2 uppercase mt-1">Admin Panel</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 text-stone hover:text-ink rounded-md hover:bg-stone/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarLinks onNavigate={() => setIsMobileOpen(false)} />
            </div>
            <div className="px-6 pt-4 text-[11px] text-stone/60 border-t border-stone/10">
              Elaanji Saree Atelier © 2026
            </div>
          </div>
        </div>
      )}
    </>
  )
}
