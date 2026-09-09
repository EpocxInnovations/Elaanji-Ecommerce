import { Link } from 'react-router-dom'
import { Instagram, Facebook, Mail } from 'lucide-react'

const SHOP_LINKS = [
  { label: 'New Arrivals', to: '/shop?filter=new-arrivals' },
  { label: 'Best Sellers', to: '/shop?sort=best_selling' },
  { label: 'Kanjivaram', to: '/shop?saree_type=kanjivaram' },
  { label: 'Banarasi', to: '/shop?saree_type=banarasi' },
  { label: 'Sale', to: '/shop?filter=sale' },
]

const SUPPORT_LINKS = [
  { label: 'Track Order', to: '/orders' },
  { label: 'Returns', to: '/orders' },
  { label: 'Contact Us', to: 'mailto:hello@elaanji.com', external: true },
]

const ABOUT_LINKS = [
  { label: 'Our Story', to: '/' },
  { label: 'Craft & Heritage', to: '/' },
]

export function Footer() {
  return (
    <footer className="bg-ink-gradient text-paper mt-24 relative overflow-hidden">
      {/* Gold gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gold/10 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-10 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-display text-2xl tracking-[0.18em] mb-3">ELAANJI</h3>
            <div className="w-10 h-px bg-gold/50 mb-4" />
            <p className="text-sm text-paper/60 leading-relaxed max-w-[240px]">
              Handpicked sarees for every occasion: crafted with tradition, delivered with care.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-paper/50 hover:text-gold-soft transition-colors"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-paper/50 hover:text-gold-soft transition-colors"
              >
                <Facebook size={18} strokeWidth={1.5} />
              </a>
              <a
                href="mailto:hello@elaanji.com"
                aria-label="Email"
                className="text-paper/50 hover:text-gold-soft transition-colors"
              >
                <Mail size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-widest2 uppercase text-gold-soft/70 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-paper/70 hover:text-gold-soft transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs tracking-widest2 uppercase text-gold-soft/70 mb-4">Support</h4>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) =>
                link.external ? (
                  <li key={link.label}>
                    <a href={link.to} className="text-sm text-paper/70 hover:text-gold-soft transition-colors">
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-paper/70 hover:text-gold-soft transition-colors">
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* The House */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-xs tracking-widest2 uppercase text-gold-soft/70 mb-4">The House</h4>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 sm:block sm:space-y-2.5">
              {ABOUT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-paper/70 hover:text-gold-soft transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-paper/10 mt-12 pt-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-md">
              <p className="text-xs tracking-widest2 uppercase text-gold-soft/70 mb-2">
                The Elaanji Edit
              </p>
              <p className="text-paper/60 text-sm mb-3 leading-relaxed">
                Subscribe for new arrivals, weaving stories and private previews.
              </p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2.5 sm:gap-0 w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full sm:w-64 md:w-72 bg-paper/5 border border-paper/20 px-4 py-3 text-sm text-paper
                           placeholder:text-paper/30 focus:border-gold/60 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="bg-gold-gradient text-ink-deep px-6 py-3 text-xs tracking-widest2 uppercase font-semibold
                           hover:shadow-gold-glow transition-all cursor-pointer shrink-0 text-center justify-center inline-flex items-center"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-paper/10 py-5 text-center text-xs text-paper/40 tracking-wide">
        © {new Date().getFullYear()} ELAANJI · The House of Saree. All rights reserved.
      </div>
    </footer>
  )
}
