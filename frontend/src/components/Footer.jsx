import { Link } from 'react-router-dom'
import { Instagram, Facebook, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-ink text-paper mt-24">
      {/* Decorative top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-display text-xl mb-3">ELAANJI</h3>
            <p className="text-sm text-paper/60 leading-relaxed max-w-[240px]">
              Handpicked sarees for every occasion — crafted with tradition, delivered with care.
            </p>
            <div className="flex items-center gap-4 mt-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-paper/50 hover:text-paper transition-colors"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-paper/50 hover:text-paper transition-colors"
              >
                <Facebook size={18} strokeWidth={1.5} />
              </a>
              <a
                href="mailto:hello@elaanji.com"
                aria-label="Email"
                className="text-paper/50 hover:text-paper transition-colors"
              >
                <Mail size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-widest2 uppercase text-paper/40 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/shop?filter=new-arrivals" className="text-sm text-paper/70 hover:text-paper transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=best_selling" className="text-sm text-paper/70 hover:text-paper transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/shop?saree_type=kanjivaram" className="text-sm text-paper/70 hover:text-paper transition-colors">
                  Kanjivaram
                </Link>
              </li>
              <li>
                <Link to="/shop?saree_type=banarasi" className="text-sm text-paper/70 hover:text-paper transition-colors">
                  Banarasi
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=sale" className="text-sm text-paper/70 hover:text-paper transition-colors">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs tracking-widest2 uppercase text-paper/40 mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/orders" className="text-sm text-paper/70 hover:text-paper transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-sm text-paper/70 hover:text-paper transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <a href="mailto:hello@elaanji.com" className="text-sm text-paper/70 hover:text-paper transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs tracking-widest2 uppercase text-paper/40 mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm text-paper/70 hover:text-paper transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-paper/70 hover:text-paper transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-paper/10 mt-12 pt-8">
          <div className="max-w-md">
            <p className="text-xs tracking-widest2 uppercase text-paper/40 mb-3">Stay in Touch</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-0">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent border border-paper/20 px-4 py-2.5 text-sm text-paper
                           placeholder:text-paper/30 focus:border-paper/50 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="bg-paper text-ink px-5 py-2.5 text-xs tracking-widest2 uppercase
                           hover:bg-beige transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-paper/10 py-5 text-center text-xs text-paper/40 tracking-wide">
        © {new Date().getFullYear()} ELAANJI. All rights reserved.
      </div>
    </footer>
  )
}
