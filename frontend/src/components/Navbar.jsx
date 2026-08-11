import { Link, NavLink } from 'react-router-dom'
import { Search, Heart, User, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'Kanjivaram', to: '/shop?saree_type=kanjivaram' },
  { label: 'Banarasi', to: '/shop?saree_type=banarasi' },
  { label: 'Designer', to: '/shop?saree_type=designer' },
  { label: 'New Arrivals', to: '/shop?filter=new-arrivals' },
  { label: 'Sale', to: '/shop?filter=sale' },
]

export function Navbar() {
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-stone/20">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-wide">
          ELAANJI
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className="text-sm tracking-wide uppercase text-ink/80 hover:text-oxblood transition-colors"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button aria-label="Search" className="hover:text-oxblood transition-colors">
            <Search size={20} />
          </button>
          <Link to="/wishlist" aria-label="Wishlist" className="hover:text-oxblood transition-colors">
            <Heart size={20} />
          </Link>
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            aria-label="Account"
            className="hover:text-oxblood transition-colors"
          >
            <User size={20} />
          </Link>
          <Link to="/cart" aria-label="Cart" className="hover:text-oxblood transition-colors">
            <ShoppingBag size={20} />
          </Link>
        </div>
      </div>
    </header>
  )
}
