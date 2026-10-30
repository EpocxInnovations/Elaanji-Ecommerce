import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  Sidebar001,
  Sidebar001Header,
  Sidebar001Content,
  Sidebar001Footer,
  Sidebar001Section,
  Sidebar001Group,
  Sidebar001Item,
} from './ui/sidebar-001'
import {
  Sparkles,
  Layers,
  Heart,
  ShoppingBag,
  User,
  ShieldCheck,
  Package,
  LogOut,
  X,
  Gem,
  Flame,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../hooks/useCart'
import { AnimatePresence, motion } from 'framer-motion'

const SidebarContext = createContext({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
})

export function useCustomerSidebar() {
  return useContext(SidebarContext)
}

export function CustomerSidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Auto-close on route change on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname, location.search])

  const toggle = () => setIsOpen((prev) => !prev)

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function CustomerSidebar() {
  const { isOpen, setIsOpen } = useCustomerSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cart } = useCart()

  const currentPath = location.pathname + location.search

  const cartCount =
    cart?.items?.filter((i) => !i.saved_for_later)
      .reduce((sum, item) => sum + item.quantity, 0) || 0

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
    navigate('/')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex pointer-events-auto">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar Drawer Container */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="relative z-10 flex h-full"
          >
            <Sidebar001 defaultWidth={280} minWidth={220} maxWidth={400} className="bg-paper shadow-2xl h-full border-r border-stone/20">
              {/* Header */}
              <Sidebar001Header className="flex items-center justify-between">
                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5">
                  <img
                    src="/brand/logo-badge.png"
                    alt="Elaanji Brand Logo"
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-gold/40 shadow-sm shrink-0"
                  />
                  <div>
                    <span className="font-display text-lg tracking-[0.15em] text-ink block leading-none">
                      ELAANJI
                    </span>
                    <span className="text-[10px] uppercase tracking-widest2 text-stone block mt-0.5">
                      The House of Sarees
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-stone hover:text-oxblood hover:bg-stone/10 rounded-md transition-colors"
                  aria-label="Close sidebar"
                >
                  <X size={18} />
                </button>
              </Sidebar001Header>

              {/* Main Nav Content */}
              <Sidebar001Content>
                {/* Saree Categories Section */}
                <Sidebar001Section label="Collections">
                  <Sidebar001Item
                    to="/shop"
                    label="All Sarees"
                    icon={<Layers size={15} />}
                    isActive={location.pathname === '/shop' && !location.search}
                  />

                  <Sidebar001Group label="Heritage Silk" defaultOpen={true} icon={<Gem size={15} />}>
                    <Sidebar001Item
                      to="/shop?saree_type=kanjivaram"
                      label="Kanjivaram Silk"
                      isActive={currentPath === '/shop?saree_type=kanjivaram'}
                    />
                    <Sidebar001Item
                      to="/shop?saree_type=banarasi"
                      label="Banarasi Brocade"
                      isActive={currentPath === '/shop?saree_type=banarasi'}
                    />
                    <Sidebar001Item
                      to="/shop?saree_type=silk"
                      label="Pure Silk"
                      isActive={currentPath === '/shop?saree_type=silk'}
                    />
                  </Sidebar001Group>

                  <Sidebar001Group label="Weaves & Drapes" defaultOpen={false} icon={<Sparkles size={15} />}>
                    <Sidebar001Item
                      to="/shop?saree_type=cotton"
                      label="Handloom Cotton"
                      isActive={currentPath === '/shop?saree_type=cotton'}
                    />
                    <Sidebar001Item
                      to="/shop?saree_type=designer"
                      label="Designer Couture"
                      isActive={currentPath === '/shop?saree_type=designer'}
                    />
                    <Sidebar001Item
                      to="/shop?saree_type=chanderi"
                      label="Chanderi & Organza"
                      isActive={currentPath === '/shop?saree_type=chanderi'}
                    />
                  </Sidebar001Group>
                </Sidebar001Section>

                {/* Highlights Section */}
                <Sidebar001Section label="Featured">
                  <Sidebar001Item
                    to="/shop?filter=new-arrivals"
                    label="New Arrivals"
                    isNew={true}
                    icon={<Sparkles size={15} />}
                    isActive={currentPath === '/shop?filter=new-arrivals'}
                  />
                  <Sidebar001Item
                    to="/shop?filter=best-sellers"
                    label="Best Sellers"
                    icon={<Flame size={15} />}
                    isActive={currentPath === '/shop?filter=best-sellers'}
                  />
                  <Sidebar001Item
                    to="/shop?filter=sale"
                    label="Curated Sale"
                    badge="Offer"
                    isActive={currentPath === '/shop?filter=sale'}
                  />
                </Sidebar001Section>

                {/* Customer Account Section */}
                <Sidebar001Section label="Personal">
                  <Sidebar001Item
                    to="/orders"
                    label="My Orders"
                    icon={<Package size={15} />}
                    isActive={location.pathname.startsWith('/orders')}
                  />
                  <Sidebar001Item
                    to="/wishlist"
                    label="Wishlist"
                    icon={<Heart size={15} />}
                    isActive={location.pathname === '/wishlist'}
                  />
                  <Sidebar001Item
                    to="/cart"
                    label="Shopping Bag"
                    badge={cartCount > 0 ? String(cartCount) : null}
                    icon={<ShoppingBag size={15} />}
                    isActive={location.pathname === '/cart'}
                  />
                  <Sidebar001Item
                    to={isAuthenticated ? '/account' : '/login'}
                    label={isAuthenticated ? 'My Account' : 'Sign In'}
                    icon={<User size={15} />}
                    isActive={location.pathname === '/account' || location.pathname === '/login'}
                  />
                  {isAdmin && (
                    <Sidebar001Item
                      to="/admin"
                      label="Admin Dashboard"
                      badge="Admin"
                      icon={<ShieldCheck size={15} />}
                      isActive={location.pathname.startsWith('/admin')}
                    />
                  )}
                </Sidebar001Section>
              </Sidebar001Content>

              {/* Footer */}
              <Sidebar001Footer>
                {isAuthenticated ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-full bg-oxblood text-paper flex items-center justify-center font-medium text-xs shrink-0">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-ink truncate">{user?.name || user?.email}</p>
                        <p className="text-[10px] text-stone truncate">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="p-1.5 text-stone hover:text-oxblood hover:bg-oxblood/10 rounded transition-colors shrink-0"
                      title="Sign Out"
                    >
                      <LogOut size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone">Welcome to Elaanji</span>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="text-oxblood font-semibold hover:underline flex items-center gap-1"
                    >
                      Sign In <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </Sidebar001Footer>
            </Sidebar001>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CustomerSidebar
