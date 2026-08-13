import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Search, Heart, User, ShoppingBag, Menu, X, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../hooks/useCart'

import { menuCurtainVariants } from '../utils/motion'

const navLinks = [
  { label: 'Kanjivaram', to: '/shop?saree_type=kanjivaram', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop' },
  { label: 'Banarasi', to: '/shop?saree_type=banarasi', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop' },
  { label: 'Designer', to: '/shop?saree_type=designer', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop' },
  { label: 'New Arrivals', to: '/shop?filter=new-arrivals', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800&auto=format&fit=crop' },
  { label: 'Sale', to: '/shop?filter=sale', image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop' },
]

export function Navbar() {
  const { isAuthenticated } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredLinkImage, setHoveredLinkImage] = useState(null)
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

      {/* Full-Screen Luxury Magazine Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={menuCurtainVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-ink text-paper z-50 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto"
          >
            {/* Header in Overlay */}
            <div className="flex items-center justify-between border-b border-paper/15 pb-6">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-display text-2xl tracking-widest uppercase">
                ELAANJI
              </Link>
              <div className="flex items-center gap-6">
                <span className="text-[10px] uppercase tracking-widest2 text-gold-light hidden sm:inline-block">
                  Pure Silk &amp; Heritage Couture
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 -mr-2 text-paper hover:text-gold-light transition-colors cursor-pointer"
                >
                  <X size={26} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Menu Content Grid */}
            <div className="grid md:grid-cols-12 gap-8 my-auto py-10 items-center">
              {/* Navigation Links Column */}
              <div className="md:col-span-7 space-y-4">
                <p className="text-[10px] text-paper/40 uppercase tracking-widest2 mb-4 font-medium">
                  Curated Catalogues
                </p>
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={link.to}
                      onMouseEnter={() => setHoveredLinkImage(link.image)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-4 text-3xl sm:text-5xl font-display text-paper/80 hover:text-paper hover:italic transition-all duration-300"
                    >
                      <span className="text-xs font-body text-gold-light opacity-0 group-hover:opacity-100 transition-opacity">0{idx + 1}</span>
                      <span className="group-hover:translate-x-2 transition-transform duration-300">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Dynamic Editorial Visual Column */}
              <div className="hidden md:block md:col-span-5 relative aspect-[3/4] overflow-hidden rounded-sm border border-paper/15 shadow-luxury">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={hoveredLinkImage || navLinks[0].image}
                    src={hoveredLinkImage || navLinks[0].image}
                    alt="Category Preview"
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 text-paper text-xs tracking-widest2 uppercase">
                  Handcrafted Heritage
                </div>
              </div>
            </div>

            {/* Footer in Overlay */}
            <div className="border-t border-paper/15 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-paper/50 gap-4">
              <div className="flex gap-6">
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="hover:text-paper transition-colors">Wishlist</Link>
                <Link to={isAuthenticated ? '/account' : '/login'} onClick={() => setMobileMenuOpen(false)} className="hover:text-paper transition-colors">
                  {isAuthenticated ? 'My Account' : 'Sign In'}
                </Link>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="hover:text-paper transition-colors">Track Order</Link>
              </div>
              <p className="tracking-widest uppercase text-[10px]">© 2026 ELAANJI — All Rights Reserved</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
