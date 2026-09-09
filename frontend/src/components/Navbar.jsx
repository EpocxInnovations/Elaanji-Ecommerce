import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Search, Heart, User, ShoppingBag, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../hooks/useCart'
import { luxuryEase, luxurySpring } from '../utils/motion'

const navLinks = [
  { label: 'Kanjivaram', to: '/shop?saree_type=kanjivaram', desc: 'Temple-woven heritage silk' },
  { label: 'Banarasi', to: '/shop?saree_type=banarasi', desc: 'Mughal-inspired brocades' },
  { label: 'Designer', to: '/shop?saree_type=designer', desc: 'Contemporary handloom weaves' },
  { label: 'New Arrivals', to: '/shop?filter=new-arrivals', desc: 'Fresh from the master looms' },
  { label: 'Sale', to: '/shop?filter=sale', desc: 'Curated promotional offers' },
]

export function Navbar() {
  const { isAuthenticated, isAdmin } = useAuth()
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
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-paper/85 backdrop-blur-xl shadow-card py-0.5'
            : 'bg-paper'
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
            <Link to="/" className="group flex items-center gap-2">
              <span className="font-display text-xl sm:text-2xl tracking-[0.14em] sm:tracking-[0.18em]">
                ELAANJI
              </span>
              <span className="hidden sm:block w-5 h-px bg-gold/50 transition-all duration-300 group-hover:w-8" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-[13px] tracking-wide uppercase transition-colors duration-200 relative py-1 group ${
                      isActive
                        ? 'text-oxblood font-medium'
                        : 'text-ink/75 hover:text-ink'
                    }`
                  }
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
                </NavLink>
              ))}
            </nav>

            {/* Icon Actions */}
            <div className="flex items-center gap-1">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-ink text-paper hover:bg-oxblood hover:text-paper transition-all text-[11px] sm:text-xs font-semibold tracking-wider uppercase border border-gold/40 shadow-sm mr-1 shrink-0"
                  title="Return to Admin Panel"
                >
                  <ShieldCheck size={13} className="text-gold" />
                  <span>Admin</span>
                </Link>
              )}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
                className="p-2.5 hover:text-oxblood transition-colors"
              >
                <Search size={20} strokeWidth={1.5} />
              </motion.button>
              <Link to="/wishlist" aria-label="Wishlist" className="p-2.5 hover:text-oxblood transition-colors hidden sm:flex">
                <motion.div whileTap={{ scale: 0.88 }}>
                  <Heart size={20} strokeWidth={1.5} />
                </motion.div>
              </Link>
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                aria-label="Account"
                className="p-2.5 hover:text-oxblood transition-colors hidden sm:flex"
              >
                <motion.div whileTap={{ scale: 0.88 }}>
                  <User size={20} strokeWidth={1.5} />
                </motion.div>
              </Link>
              <Link to="/cart" aria-label="Cart" className="p-2.5 hover:text-oxblood transition-colors relative">
                <motion.div
                  key={cartCount}
                  initial={{ scale: 1 }}
                  animate={{ scale: cartCount > 0 ? [1, 1.25, 1] : 1 }}
                  transition={luxurySpring}
                >
                  <ShoppingBag size={20} strokeWidth={1.5} />
                </motion.div>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={luxurySpring}
                    className="absolute top-1 right-0.5 bg-gold-gradient text-ink-deep text-[10px] font-bold leading-none min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Overlay — Luxury Full Width Dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: luxuryEase }}
              className="border-b border-stone/10 bg-beige/30 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
                <div className="relative">
                  <Search size={22} className="absolute left-0 top-1/2 -translate-y-1/2 text-stone" strokeWidth={1.5} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Kanjivaram, Banarasi, Organza, Silk…"
                    className="w-full pl-9 pr-12 py-3 bg-transparent border-b-2 border-gold/30 font-display text-lg sm:text-xl text-ink
                               focus:border-gold focus:outline-none transition-colors placeholder:text-stone/50"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                    aria-label="Close search"
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-stone hover:text-ink transition-colors"
                  >
                    <X size={20} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 text-xs text-stone">
                  <span className="uppercase tracking-widest2 text-[10px] self-center mr-2 text-stone/70">Popular:</span>
                  {['Kanjivaram Silk', 'Bridal Red', 'Banarasi Brocade', 'Organza Designer'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setSearchQuery(term)
                        navigate(`/shop?search=${encodeURIComponent(term)}`)
                        setSearchOpen(false)
                      }}
                      className="px-3 py-1 bg-paper border border-stone/20 hover:border-gold hover:text-gold transition-colors rounded-full"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Editorial Full-Screen Menu Takeover */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'circle(0% at top left)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at top left)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at top left)' }}
            transition={{ duration: 0.5, ease: luxuryEase }}
            className="fixed inset-0 bg-ink-gradient text-paper z-50 flex flex-col justify-between p-6 sm:p-10 md:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-paper/15 pb-6">
              <span className="font-display text-2xl tracking-[0.18em] text-paper">ELAANJI</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 -mr-2 text-paper hover:text-gold-soft transition-colors"
              >
                <X size={26} strokeWidth={1.5} />
              </button>
            </div>

            {/* Background Watermark */}
            <div className="absolute right-4 bottom-1/4 pointer-events-none select-none opacity-[0.05] text-paper">
              <p className="font-display text-[160px] leading-none">ए</p>
            </div>

            {/* Navigation Links Stagger */}
            <nav className="my-auto py-8 space-y-6" aria-label="Mobile menu links">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.06, duration: 0.45, ease: luxuryEase }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex flex-col border-b border-paper/10 pb-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl sm:text-3xl text-paper group-hover:text-gold-soft transition-colors">
                        {link.label}
                      </span>
                      <ArrowRight size={18} className="text-paper/40 group-hover:text-gold-soft group-hover:translate-x-1 transition-all" />
                    </div>
                    <span className="text-xs text-paper/60 mt-1 tracking-wide">{link.desc}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Footer Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="border-t border-paper/15 pt-6 space-y-3"
            >
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full btn-primary !py-2.5 text-xs text-center flex items-center justify-center gap-2 shadow-gold-glow font-semibold tracking-wider uppercase"
                >
                  <ShieldCheck size={16} />
                  Admin Dashboard
                </Link>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary-dark !py-2.5 text-xs text-center flex items-center justify-center gap-2"
                >
                  <Heart size={16} strokeWidth={1.5} />
                  Wishlist
                </Link>
                <Link
                  to={isAuthenticated ? '/account' : '/login'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary !py-2.5 text-xs text-center flex items-center justify-center gap-2"
                >
                  <User size={16} strokeWidth={1.5} />
                  {isAuthenticated ? 'Account' : 'Sign In'}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
