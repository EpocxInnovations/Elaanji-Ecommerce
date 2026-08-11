import { useState } from 'react'
import { NavLink } from 'react-router-dom'
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
              isActive ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-beige'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-stone/20 bg-paper h-screen sticky top-0 py-6">
        <div className="px-6 mb-8">
          <span className="font-display text-xl">ELAANJI</span>
          <p className="text-xs text-stone tracking-widest2 uppercase mt-1">Admin Panel</p>
        </div>
        <SidebarLinks />
      </aside>

      {/* Mobile drawer trigger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-stone/20 bg-paper sticky top-0 z-30">
        <span className="font-display text-lg">ELAANJI Admin</span>
        <button onClick={() => setIsMobileOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-paper h-full py-6 overflow-y-auto">
            <div className="flex items-center justify-between px-6 mb-8">
              <span className="font-display text-xl">ELAANJI</span>
              <button onClick={() => setIsMobileOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <SidebarLinks onNavigate={() => setIsMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-ink/40" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}
    </>
  )
}
