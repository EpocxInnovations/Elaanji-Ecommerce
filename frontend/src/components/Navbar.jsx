import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Search, Heart, User, ShoppingBag, Menu, X, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../hooks/useCart'

const navLinks = [
  { label: 'Kanjivaram', to: '/shop?saree_type=kanjivaram' },
  { label: 'Banarasi', to: '/shop?saree_type=banarasi' },
  { label: 'Designer', to: '/shop?saree_type=designer' },
  { label: 'New Arrivals', to: '/shop?filter=new-arrivals' },
  { label: 'Sale', to: '/shop?filter=sale' },
]

export function Navbar() {
  const { isAuthenticated } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const searchInputRef = useRef(null)

  const cartCount = cart?.items?.filter((i) => !i.saved_for_later)
    .reduce((sum, item) => sum + item.quantity, 0) || 0

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Track scroll for header shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [searchOpen])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-paper/95 backdrop-blur-sm transition-shadow duration-300 ${
          scrolled ? 'shadow-card' : ''
        }`}
      >
        <div className="border-b border-stone/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="md:hidden -ml-1 p-2 hover:text-oxblood transition-colors"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>

            {/* Logo */}
            <Link to="/" className="font-display text-2xl tracking-wide">
              ELAANJI
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-[13px] tracking-wide uppercase transition-colors duration-300 relative py-1 group ${
                      isActive ? 'text-oxblood font-medium' : 'text-ink/75 hover:text-ink'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {/* Underline center-out hover expand */}
                      <span className={`absolute bottom-0 left-0 right-0 h-px bg-oxblood transform origin-center transition-transform duration-300 ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`} />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Icon Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
                className="p-2.5 text-ink/80 hover:text-oxblood transition-colors cursor-pointer"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              <Link to="/wishlist" aria-label="Wishlist" className="p-2.5 text-ink/80 hover:text-oxblood transition-colors hidden sm:flex">
                <Heart size={20} strokeWidth={1.5} />
              </Link>
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                aria-label="Account"
                className="p-2.5 text-ink/80 hover:text-oxblood transition-colors hidden sm:flex"
              >
                <User size={20} strokeWidth={1.5} />
              </Link>
              <Link to="/cart" aria-label="Cart" className="p-2.5 text-ink/80 hover:text-oxblood transition-colors relative">
                <ShoppingBag size={20} strokeWidth={1.5} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 350 }}
                      className="absolute top-1 right-0.5 bg-oxblood text-paper text-[10px] font-medium leading-none min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full shadow-sm"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="border-b border-stone/15 bg-paper/98 overflow-hidden shadow-inner"
            >
              <form onSubmit={handleSearch} className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/60" strokeWidth={1.5} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for sarees, fabrics, occasions…"
                    className="w-full pl-10 pr-10 py-3 bg-transparent border-b border-stone/30 text-sm
                               focus:border-ink focus:outline-none transition-colors placeholder:text-stone/50"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                    aria-label="Close search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone hover:text-ink transition-colors"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overlay-backdrop md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-y-0 left-0 w-[280px] bg-paper z-50 flex flex-col shadow-overlay md:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone/10">
                <span className="font-display text-lg tracking-wide">ELAANJI</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 -mr-2 hover:text-oxblood transition-colors"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4" aria-label="Mobile navigation">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                  >
                    <Link
                      to={link.to}
                      className="flex items-center justify-between px-5 py-3.5 text-sm tracking-wide uppercase
                                 text-ink/80 hover:text-oxblood hover:bg-beige/40 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                      <ChevronRight size={14} className="text-stone/40" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="border-t border-stone/10 px-5 py-4 space-y-3">
                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 text-sm text-ink/80 hover:text-oxblood transition-colors py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart size={18} strokeWidth={1.5} />
                  Wishlist
                </Link>
                <Link
                  to={isAuthenticated ? '/account' : '/login'}
                  className="flex items-center gap-3 text-sm text-ink/80 hover:text-oxblood transition-colors py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} strokeWidth={1.5} />
                  {isAuthenticated ? 'My Account' : 'Sign In'}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
